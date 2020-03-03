import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import {getToken, parseUserId} from '../../auth/utils'
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import * as AWS from "aws-sdk";

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(`deleteTodo is processing event`)

    const todoId = event.pathParameters.todoId
    const jwtToken = getToken(event.headers.Authorization)

    const deletedTodo = await deleteTodoService(todoId, jwtToken)

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            item: deletedTodo
        })
    }

}

//SERVICE
export async function deleteTodoService(todoId: string, jwtToken: string
): Promise<any> {
    const activeUser = parseUserId(jwtToken)
    return await deleteTodoResource(todoId, activeUser)
}

//RESOURCE
export async function deleteTodoResource(todoId: string, activeUser: string): Promise<any> {

    console.log(`Deleting item with userId ${activeUser} and todoId ${todoId}`)

    const params = {
        TableName: process.env.TODO_TABLE,
        Key: { todoId },
        ConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': activeUser
        },
        ReturnValues: "ALL_OLD"
    }

    const documentClient: DocumentClient = new AWS.DynamoDB.DocumentClient()
    return await documentClient.delete(params).promise()
}
