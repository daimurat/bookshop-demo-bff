import protoLoader from '@grpc/proto-loader'
import grpc from '@grpc/grpc-js'

const ProtoPath = './proto/orders.proto'
const packageDefinition = protoLoader.loadSync(ProtoPath)
const order_proto = grpc.loadPackageDefinition(packageDefinition).order

const clientUri = process.env.ORDER_CLIENT_URI || "localhost:50052"
console.log(clientUri)

const client = new order_proto.OrderService(
    clientUri, grpc.credentials.createInsecure()
)
        
export class OrderDataSource {
    constructor(options) {
        this.client = client
    }

    async getOrder(orderId) {
        return new Promise((resolve, reject) => {
            this.client.GetOrder({orderId: orderId}, (error, response) => {
                if (error) {
                    return reject(error)
                } else {
                    return resolve(response.order);
                }
            });
        });
    }

    async listOrders(customerId) {
        return new Promise((resolve, reject) => {
            this.client.ListOrders({customerId: customerId}, (error, response) => {
                if (error) {
                    return reject(error)
                } else {
                    return resolve(response.orders);
                }
            });
        });
    }

    async createOrder(input) {
        const param = {
            customerId: input.customerId,
            customerName: input.customerName,
            orderItem: input.orderItem
        }
        return new Promise((resolve, reject) => {
            
            this.client.createOrder(param, (error, response) => {
                if (error) {
                    return reject(error)
                } else {
                    return resolve(response.orderId);
                }
            });
        });
    }
}