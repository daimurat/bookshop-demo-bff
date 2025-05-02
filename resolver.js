export const resolvers = {
    Query: {
      book: async (parent, args, context) => {
        const response = await context.dataSources.catalogueApi.getBook(args.id)
        return response
      },
      books: async (parent, args, context) => {
        const response = await context.dataSources.catalogueApi.listBooks()
        return response
      },
      order: async (parent, args, context) => {
        const response = await context.dataSources.orderApi.getOrder(args.orderId)
        
        response.orderItem = await Promise.all(
          response.orderItem.map(async (order) => {
            const book = await context.dataSources.catalogueApi.getBook(order.itemId)

            return {
              itemId: order.itemId,
              title: book.title,
              author: book.author,
              quantity: order.quantity,
              unitPrice: order.unitPrice
            }
          })
        )

        return response
      },
      orders: async (parent, args, context) => {
        const response = await context.dataSources.orderApi.listOrders(args.customerId)
        return response
      },
    },
    Mutation: {
      createOrder: async (parent, args, context) => {
        const response = await context.dataSources.orderApi.createOrder(args.input)
        return response
      }
    }
  };
