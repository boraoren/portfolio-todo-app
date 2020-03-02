import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import * as uuid from 'uuid'
import {TodoItem} from "../../models/TodoItem";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {getToken, parseUserId} from '../../auth/utils'


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.info(`createTodo is processing event`)

    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    const jwtToken = getToken(event.headers.Authorization)
    console.info(`Received JWT token: ${jwtToken}`)

    const newItem = await createTodoService(newTodo, jwtToken)

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            item: newItem
        })
    }
}

/// SERVICE
export async function createTodoService(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string
): Promise<TodoItem> {

    const todoId = uuid.v4()
    const userId = parseUserId(jwtToken)

    return await createTodoResource({
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        task: createTodoRequest.task,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: undefined
    })
}

/// RESOURCE
export async function createTodoResource(todo: TodoItem): Promise<TodoItem> {
    console.info(`Creating a Todo item with todoId ${todo.todoId}`)
    const documentClient: DocumentClient = new AWS.DynamoDB.DocumentClient()
    await documentClient.put({
        TableName: process.env.TODO_TABLE,
        Item: todo
    }).promise()
    return todo
}



