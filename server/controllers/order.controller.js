import Stripe from "../config/stripe.js";
import CartProductModel from "../models/mysql/cartproduct.model.js";
import OrderModel from "../models/mysql/order.model.js";
import UserModel from "../models/mysql/user.model.js";
import Address from '../models/mysql/address.model.js'; // Chemin à adapter selon ton projet

export async function CashOnDeliveryOrderController(request, response) {
  try {
    const userId = request.userId; // auth middleware
    const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

    const payload = list_items.map(el => ({
      userId: userId,
      orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // remplacement de mongoose.ObjectId
      productId: el.productId.id, // Sequelize utilise .id et non _id
      product_details: JSON.stringify({ // Sequelize ne supporte pas les objets imbriqués directement (selon ta définition)
        name: el.productId.name,
        image: el.productId.image
      }),
      paymentId: "",
      payment_status: "CASH ON DELIVERY",
      delivery_address: addressId,
      subTotalAmt: subTotalAmt,
      totalAmt: totalAmt,
    }));

    // insertion multiple avec bulkCreate
    const generatedOrder = await OrderModel.bulkCreate(payload);

    // Suppression des articles du panier pour l'utilisateur
    await CartProductModel.destroy({ where: { userId: userId } });

    // Mise à jour de l'utilisateur (shopping_cart = [])
    await UserModel.update({ shopping_cart: [] }, { where: { id: userId } });

    return response.json({
      message: "Order successfully placed",
      error: false,
      success: true,
      data: generatedOrder
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}

export const pricewithDiscount = (price, dis = 1) => {
  const discountAmount = Math.ceil((Number(price) * Number(dis)) / 100);
  const actualPrice = Number(price) - Number(discountAmount);
  return actualPrice;
};

export async function paymentController(request, response) {
  try {
    const userId = request.userId; // auth middleware
    const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

    const user = await UserModel.findByPk(userId);

    const line_items = list_items.map(item => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.productId.name,
          images: [item.productId.image], // Stripe attend un tableau d’images
          metadata: {
            productId: item.productId.id
          }
        },
        unit_amount: pricewithDiscount(item.productId.price, item.productId.discount) * 100
      },
      adjustable_quantity: {
        enabled: true,
        minimum: 1
      },
      quantity: item.quantity
    }));

    const params = {
      submit_type: 'pay',
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      metadata: {
        userId: userId,
        addressId: addressId
      },
      line_items: line_items,
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`
    };

    const session = await Stripe.checkout.sessions.create(params);

    return response.status(200).json(session);
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}

const getOrderProductItems = async ({ lineItems, userId, addressId, paymentId, payment_status }) => {
  const productList = [];

  if (lineItems?.data?.length) {
    for (const item of lineItems.data) {
      const product = await Stripe.products.retrieve(item.price.product);

      productList.push({
        userId: userId,
        orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId: product.metadata.productId,
        product_details: JSON.stringify({
          name: product.name,
          image: product.images
        }),
        paymentId: paymentId,
        payment_status: payment_status,
        delivery_address: addressId,
        subTotalAmt: Number(item.amount_total / 100),
        totalAmt: Number(item.amount_total / 100),
      });
    }
  }
  return productList;
};

// http://localhost:8080/api/order/webhook
export async function webhookStripe(request, response) {
  const event = request.body;
  const endPointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY;

  console.log("event", event);

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const lineItems = await Stripe.checkout.sessions.listLineItems(session.id);
      const userId = session.metadata.userId;
      const orderProduct = await getOrderProductItems({
        lineItems: lineItems,
        userId: userId,
        addressId: session.metadata.addressId,
        paymentId: session.payment_intent,
        payment_status: session.payment_status,
      });

      const order = await OrderModel.bulkCreate(orderProduct);

      if (order.length > 0) {
        await UserModel.update({ shopping_cart: [] }, { where: { id: userId } });
        await CartProductModel.destroy({ where: { userId: userId } });
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  response.json({ received: true });
}

export async function getOrderDetailsController(request, response) {
  try {
    const userId = request.userId;

    const orderlist = await OrderModel.findAll({
      where: { userId: userId },
      order: [['createdAt', 'DESC']],
      include: [{
        model: Address,
        as: 'address'
      }]
    });

    return response.json({
      message: "Order list",
      data: orderlist,
      error: false,
      success: true
    });
  } catch (error) {
    console.error("Erreur getOrderDetailsController:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}
