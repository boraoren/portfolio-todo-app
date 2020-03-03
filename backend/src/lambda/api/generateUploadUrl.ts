import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import {getToken, parseUserId} from '../../auth/utils'
import {DocumentClient} from "aws-sdk/clients/dynamodb";

const s3 = new AWS.S3({ signatureVersion: 'v4' })

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION)

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(`generateUploadUrl is processing event`)

    const todoId = event.pathParameters.todoId
    const jwtToken = getToken(event.headers.Authorization)

    const newImage = await generateUploadService(todoId, jwtToken)
    const uploadUrl = getUploadUrl(todoId)

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            imageData: newImage,
            uploadUrl: uploadUrl
        })
    }

}

//SERVICE
export async function generateUploadService(todoId: string,
                                     jwtToken: string
): Promise<string> {
    const activeUser = parseUserId(jwtToken)
    return await updateURLRepository(todoId, activeUser)
}

//RESOURCE
export async function updateURLRepository(todoId: string,
    activeUser: string
): Promise<any> {
    console.log(`Updating attachmentUrl for todo item: ${todoId}`)

    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`

    const params = {
        TableName: process.env.TODO_TABLE,
        Key: { todoId },
        UpdateExpression: 'set attachmentUrl = :a',
        ConditionExpression: 'userId = :uId',
        ExpressionAttributeValues: {
            ':a':imageUrl,
            ':uId':activeUser
        },
        ReturnValues: "UPDATED_NEW"
    }

    const documentClient: DocumentClient = new AWS.DynamoDB.DocumentClient()
    return await documentClient.update(params).promise()
}

//UTIL
function getUploadUrl(todoId: string) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: urlExpiration
    })
}
