import { orderCreated } from 'src/consts';
import { items, total } from 'src/helpers/validators';
import { invalidString, invalidFloat, invalidObject } from 'tests/consts';

export class OrdersController {
  async getAllOrders() {
    return [
      {
        id: 1,
        customer: 'Mock Customer',
        total: 100,
        items: [{ product_id: 1, quantity: 2 }],
        created_at: new Date().toISOString(),
      },
    ];
  }

  async createOrder(order: any) {
    if (!order.customer)
      throw { status: 400, details: [{ property: 'body.customer', message: 'required' }] };
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0)
      throw { status: 400, details: [{ property: 'items', message: items }] };
    if (!order.total || typeof order.total !== 'number' || order.total <= 0)
      throw { status: 400, details: [{ property: 'total', message: total }] };
    if (typeof order.customer !== 'string')
      throw { status: 400, details: [{ property: 'body.customer', message: invalidString }] };
    if (typeof order.total !== 'number')
      throw { status: 400, details: [{ property: 'body.total', message: invalidFloat }] };
    if (!Array.isArray(order.items))
      throw { status: 400, details: [{ property: 'items.$0', message: invalidObject }] };

    return { orderId: 1, message: orderCreated };
  }
}
