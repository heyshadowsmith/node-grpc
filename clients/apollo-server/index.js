const path = require('path')

const { ApolloServer, gql } = require('apollo-server')
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')

async function main() {
    try {
        const server = getServer()
        const { url } = await server.listen({ port: process.env.PORT || 4002 })

        console.log(`Apollo Server is ready at ${url}`)
    } catch (error) {
        console.error(error)
    }
}

function getServer() {
    const server = new ApolloServer({
        typeDefs: gql`
            type Query {
                ping(message: String!): String!
            }
        `,
        resolvers: {
            Query: {
                ping: (_parent, { message }, { grpcDataSources }, _info) => {
                    const pingMessage = new Promise((resolve, reject) => {
                        grpcDataSources.dummy.PingPong({
                            message
                        }, (error, result) => {
                            if (error) {
                                reject(error)
                            }
                    
                            resolve(result.message)
                        })
                    })

                    return pingMessage
                }
            }
        },
        context: async () => ({
            grpcDataSources: {
                dummy: await initializeDummyClient()
            }
        })
    })

    return server
}

function initializeDummyClient() {
    const PROTO_FILE = '../../server/proto/dummy.proto'

    const packageDef = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE))

    const grpcObj = grpc.loadPackageDefinition(packageDef)

    const client = new grpcObj.dummyPackage.Dummy(
        '0.0.0.0:4001',
        grpc.credentials.createInsecure()
    )

    const deadline = new Date()
    deadline.setSeconds(deadline.getSeconds() + 5)

    return new Promise((resolve, reject) => {
        client.waitForReady(deadline, (error) => {
            if (error) {
                reject(error)
            }
    
            resolve(client)
        })
    })
}

main()