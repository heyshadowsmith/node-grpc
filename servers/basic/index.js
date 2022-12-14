const path = require('path')

// Pure JavaScript gRPC Client with 4.9 million weekly downloads
// https://www.npmjs.com/package/@grpc/grpc-js
const grpc = require('@grpc/grpc-js')

// .proto file loader with 6.6 million weekly downloads
// https://www.npmjs.com/package/@grpc/proto-loader
const protoLoader = require('@grpc/proto-loader')

const PROTO_FILE = './proto/dummy.proto'

// Load dummyPackage protobuf file's package definition - https://www.npmjs.com/package/@grpc/proto-loader
const packageDef = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE))

// Add dummyPackage to gRPC Object - https://www.npmjs.com/package/@grpc/proto-loader
const grpcObj = grpc.loadPackageDefinition(packageDef)
const dummyPackage = grpcObj.dummyPackage

function main() {
    // Initialize server
    const server = getServer()
    
    // Start server
    server.bindAsync('0.0.0.0:4001', 
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) {
            console.error(error)
            return
        }

        console.log(`Node gRPC server is ready at http://localhost:${port}/`)

        server.start()
    })
}

function getServer() {
    const server = new grpc.Server()

    // Add service to gRPC Server
    server.addService(dummyPackage.Dummy.service, {
        // Add RPC resolver
        PingPong: (req, res) => {
            res(null, req.request)
        }
    })

    return server
}

main()