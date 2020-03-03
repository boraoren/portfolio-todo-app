import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import {getToken, parseUserId} from '../../auth/utils'
import {TodoItem} from "../../models/TodoItem";
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import * as AWS from "aws-sdk";
import {createLogger} from "../../utils/logger";

const logger = createLogger('getTodos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const jwtToken = getToken(event.headers.Authorization)
    logger.info(`Received JWT token: ${jwtToken}`)

    const todos = await getAllTodosService(jwtToken)

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            items: todos
        })
    }
}

//SERVICE
export async function getAllTodosService(jwtToken: string): Promise<TodoItem[]> {
    const activeUser = parseUserId(jwtToken)
    return await getAllTodosResource(activeUser)
}

//RESOURCE
export async function getAllTodosResource(activeUser: string): Promise<TodoItem[]> {
    logger.info(`Getting all Todos for user: ${activeUser}`)
    const documentClient: DocumentClient = new AWS.DynamoDB.DocumentClient()

    const params = {
        TableName: process.env.TODO_TABLE,
        IndexName: process.env.INDEX_USER_ID,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': activeUser
        },
        ScanIndexForward: false
    }

    const result = await documentClient.query(params).promise()

    const todos = result.Items

    return todos as TodoItem[]
}
