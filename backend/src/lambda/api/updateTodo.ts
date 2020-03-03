import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import {getToken, parseUserId} from '../../auth/utils'
import {DocumentClient} from "aws-sdk/clients/dynamodb"
import * as AWS from "aws-sdk"
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest"

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(`updateTodo is processing event`)

    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const jwtToken = getToken(event.headers.Authorization)

    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    const changedTodo = await updateTodoService(todoId, updatedTodo, jwtToken)

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            item: changedTodo
        })
    }

}

//SERVICE
export async function updateTodoService(todoId: string,
                                        updatedTodo: UpdateTodoRequest,
                                        jwtToken: string
): Promise<any> {
    const activeUser = parseUserId(jwtToken)
    return await updateTodoResource(todoId, updatedTodo, activeUser)
}

//RESOURCE
export async function updateTodoResource(todoId: string,
                                         updatedTodo: UpdateTodoRequest,
                                         activeUser: string): Promise<any> {
    console.log(`dataLayer updateTodo updating item with todoId ${todoId}`)

    const params = {
        TableName: process.env.TODO_TABLE,
        Key: {todoId},
        UpdateExpression: 'set task = :t, dueDate = :dD, done = :d',
        ConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':t': updatedTodo.task,
            ':dD': updatedTodo.dueDate,
            ':d': updatedTodo.done,
            ':userId': activeUser
        },
        ReturnValues: "ALL_NEW"
    }

    const documentClient: DocumentClient = new AWS.DynamoDB.DocumentClient()
    const result = await documentClient.update(params).promise()

    console.log(`todo updated,  result is : ${result}`)
    return result
}
