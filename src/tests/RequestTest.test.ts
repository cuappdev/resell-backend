import { Connection } from 'typeorm';

import { UuidParam } from '../api/validators/GenericRequests';
import { RequestModel } from '../models/RequestModel';
import { ControllerFactory } from './controllers';
import { DatabaseConnection, DataFactory, RequestFactory, UserFactory } from './data';

let uuidParam: UuidParam;
let expectedRequest: RequestModel;
let conn: Connection;

beforeAll(async () => {
  await DatabaseConnection.connect();
});

beforeEach(async () => {
  await DatabaseConnection.clear();
  conn = await DatabaseConnection.connect();

  uuidParam = new UuidParam();
  uuidParam.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';

  expectedRequest = new RequestModel();
  expectedRequest.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';
  expectedRequest.title = 'Textbook';
  expectedRequest.description = 'Textbook for CS 1110';
});

afterAll(async () => {
  await DatabaseConnection.clear();
  await DatabaseConnection.close();
});

describe('request tests', () => {
  test('get all requests - no requests', async () => {
    const requestController = ControllerFactory.request(conn);

    const getRequestsResponse = await requestController.getRequests();

    expect(getRequestsResponse.requests).toHaveLength(0);
  });

  test('get all requests - one request', async () => {
    const requestController = ControllerFactory.request(conn);
    const request = RequestFactory.fake();

    await new DataFactory()
      .createRequests(request)
      .write();

    const getRequestsResponse = await requestController.getRequests();

    expect(getRequestsResponse.requests).toHaveLength(1);
  });

  test('get all requests - multiple requests', async () => {
    const requestController = ControllerFactory.request(conn);
    const [request1, request2] = RequestFactory.create(2);

    await new DataFactory()
      .createRequests(request1, request2)
      .write();

    const getRequestsResponse = await requestController.getRequests();

    expect(getRequestsResponse.requests).toHaveLength(2);
  });

  test('get request by id', async () => {
    const requestController = ControllerFactory.request(conn);
    const request = RequestFactory.fakeTemplate();

    await new DataFactory()
      .createRequests(request)
      .write();

    const getRequestResponse = await requestController.getRequestById(uuidParam);

    expect(getRequestResponse.request).toEqual(expectedRequest);
  });

  test('get request by user id', async () => {
    const requestController = ControllerFactory.request(conn);
    const request = RequestFactory.fakeTemplate();
    request.user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createRequests(request)
      .createUsers(request.user)
      .write();

    expectedRequest.user = request.user;

    const getRequestsResponse = await requestController.getRequestsByUserId(uuidParam);

    expect(getRequestsResponse.requests).toEqual([expectedRequest]);
  });

  test('create request', async () => {
    const requestController = ControllerFactory.request(conn);
    const user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createUsers(user)
      .write();

    const newRequest = {
      title: 'Textbook',
      description: 'Textbook for CS 1110',
      userId: user.id,
    };

    const getRequestResponse = await requestController.createRequest(newRequest);
    const getRequestsResponse = await requestController.getRequests();

    expectedRequest.id = getRequestResponse.request.id;
    expectedRequest.user = user;

    expect(getRequestResponse.request).toEqual(expectedRequest);
    expect(getRequestsResponse.requests).toEqual([expectedRequest]);
  });

  test('delete request by id', async () => {
    const requestController = ControllerFactory.request(conn);
    const request = RequestFactory.fakeTemplate();
    request.user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createRequests(request)
      .createUsers(request.user)
      .write();

    let getRequestsResponse = await requestController.getRequests();
    expect(getRequestsResponse.requests).toHaveLength(1);

    const getRequestResponse = await requestController.deleteRequestById(uuidParam);
    expect(getRequestResponse.request.title).toEqual('Textbook');

    getRequestsResponse = await requestController.getRequests();
    expect(getRequestsResponse.requests).toHaveLength(0);
  });
});