import { RequestController } from 'src/api/controllers/RequestController';
import { Connection } from 'typeorm';

import { UuidParam } from '../api/validators/GenericRequests';
import { RequestModel } from '../models/RequestModel';
import { ControllerFactory } from './controllers';
import { DatabaseConnection, DataFactory, RequestFactory, UserFactory } from './data';

let uuidParam: UuidParam;
let expectedRequest: RequestModel;
let conn: Connection;
let requestController: RequestController;

jest.setTimeout(20000)

beforeAll(async () => {
  await DatabaseConnection.connect();
});

beforeEach(async () => {
  await DatabaseConnection.clear();
  conn = await DatabaseConnection.connect();
  requestController = ControllerFactory.request(conn);

  uuidParam = new UuidParam();
  uuidParam.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';

  expectedRequest = new RequestModel();
  expectedRequest.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';
  expectedRequest.title = 'Textbook';
  expectedRequest.description = 'Textbook for CS 1110';
  expectedRequest.archive = false;
  expectedRequest.embedding = null as any;
});

afterAll(async () => {
  await DatabaseConnection.clear();
  await DatabaseConnection.close();
});

describe('request tests', () => {
  test('get all requests - no requests', async () => {
    const getRequestsResponse = await requestController.getRequests();

    expect(getRequestsResponse.requests).toHaveLength(0);
  });

  test('get all requests - one request', async () => {
    const request = RequestFactory.fake();

    await new DataFactory()
      .createRequests(request)
      .write();

    const getRequestsResponse = await requestController.getRequests();

    expect(getRequestsResponse.requests).toHaveLength(1);
  });

  test('get all requests - multiple requests', async () => {
    const [request1, request2] = RequestFactory.create(2);

    await new DataFactory()
      .createRequests(request1, request2)
      .write();

    const getRequestsResponse = await requestController.getRequests();

    expect(getRequestsResponse.requests).toHaveLength(2);
  });

  test('get request by id', async () => {
    const request = RequestFactory.fakeTemplate();

    await new DataFactory()
      .createRequests(request)
      .write();

    const getRequestResponse = await requestController.getRequestById(uuidParam);

    expect(getRequestResponse.request).toEqual(expectedRequest);
  });

  test('get request by user id', async () => {
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
    const user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createUsers(user)
      .write();

    const newRequest = {
      title: 'Textbook',
      description: 'Textbook for CS 1110',
      archive: false,
      userId: user.firebaseUid,
    };

    const getRequestResponse = await requestController.createRequest(newRequest);
    const getRequestsResponse = await requestController.getRequests();

    expectedRequest.id = getRequestResponse.request.id;
    expectedRequest.user = user;

    expect(getRequestResponse.request).toEqual(expectedRequest);
    expect(getRequestsResponse.requests).toEqual([expectedRequest]);
  });

  test('delete request by id', async () => {
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

// test('get matches by request id', async () => {
//     const request = RequestFactory.fakeTemplate();
//     const user = UserFactory.fakeTemplate();

//     await new DataFactory()
//       .createRequests(request)
//       .createUsers(user)
//       .write();
    
//     const newPost = {
//       title: 'Textbook',
//       description: 'Textbook for 3110',
//       categories: ['f4c9ad85-9015-45b1-b52f-5d7402313887'],
//       condition: 'NEW',
//       original_price: 500.15,
//       imagesBase64: [],
//       created: 1667192023,
//       userId: user.firebaseUid,
//     };

//     await ControllerFactory.post(conn).createPost(newPost);

//     const getPostsResponse = await requestController.getMatchesByRequestId({ id: uuidParam.id, time: undefined });
//     expect(getPostsResponse.posts).toHaveLength(1);
//   });
});