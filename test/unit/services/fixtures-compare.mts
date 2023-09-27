import { type PhotoEntry, responseFactory } from '@myrotvorets/facex';

export const startCompareAckError = responseFactory({
    ans_type: 16,
    signature: '',
    data: {
        id: 'x',
        client_id: 'FaceX/Test',
        reqID_serv: 'dd85c712-0863-4207-acb4-9b5aa9f365f4',
        reqID_clnt: '380804d9-ae81-4cb6-80df-eda6fe69ab99',
        segment: '0',
        datetime: '2021-10-05 15:11:30',
        result_code: -1,
        results_amount: 0,
        comment: 'Error',
        fotos: [],
    },
});

export const startCompareAckSuccess_raw = {
    ans_type: 16,
    signature: '',
    data: {
        id: 'x',
        client_id: 'FaceX/Test',
        reqID_serv: 'dd85c712-0863-4207-acb4-9b5aa9f365f4',
        reqID_clnt: '380804d9-ae81-4cb6-80df-eda6fe69ab99',
        segment: '0',
        datetime: '2021-10-05 15:11:30',
        result_code: 3,
        results_amount: 0,
        comment: '',
        fotos: [] as PhotoEntry[],
    },
} as const;

export const startCompareAckSuccess = responseFactory(startCompareAckSuccess_raw);

export const uploadCompareAckError = responseFactory({
    ans_type: 17,
    signature: '',
    data: {
        id: 'x',
        client_id: 'FaceX/Test',
        reqID_serv: 'dd85c712-0863-4207-acb4-9b5aa9f365f4',
        reqID_clnt: 'cc22f018-c69c-4fb9-addf-a38fc16160e7',
        segment: '0',
        datetime: '2021-10-05 15:11:31',
        result_code: -1,
        results_amount: 0,
        comment: 'Error',
        fotos: [],
    },
});

export const uploadCompareAckSuccess = responseFactory({
    ans_type: 17,
    signature: '',
    data: {
        id: 'x',
        client_id: 'FaceX/Test',
        reqID_serv: 'dd85c712-0863-4207-acb4-9b5aa9f365f4',
        reqID_clnt: 'cc22f018-c69c-4fb9-addf-a38fc16160e7',
        segment: '0',
        datetime: '2021-10-05 15:11:31',
        result_code: 3,
        results_amount: 0,
        comment: '',
        fotos: [],
    },
});

export const compareGUID = '40dd4dc9-d752-4c13-bbf0-ff6b619cf6b0';

export const compareStatusUnknown = responseFactory({
    ans_type: 0,
    signature: '',
    data: {
        id: 'x',
        client_id: 'FaceX/Test',
        reqID_serv: compareGUID,
        reqID_clnt: '093aa5de-68a0-49e7-b130-4545a10cfde0',
        segment: '0',
        datetime: '2021-10-05 15:11:31',
        result_code: 3,
        results_amount: 0,
        comment: '',
        fotos: [],
    },
});

export const compareCompletedPending = responseFactory({
    ans_type: 18,
    signature: '',
    data: {
        id: 'x',
        client_id: 'FaceX/Test',
        reqID_serv: compareGUID,
        reqID_clnt: 'fa56962d-398f-4116-b75f-7b14f7f31648',
        segment: '0',
        datetime: '2021-10-05 15:11:32',
        result_code: 2,
        results_amount: 0,
        comment: '',
        fotos: [],
    },
});

export const compareCompletedNotRecognized = responseFactory({
    ans_type: 18,
    signature: '',
    data: {
        id: 'x',
        client_id: 'FaceX/Test',
        reqID_serv: compareGUID,
        reqID_clnt: 'df5b6f22-84c3-41aa-ac2b-a4587c928ddc',
        segment: '0',
        datetime: '2021-10-05 15:11:32',
        result_code: -3,
        results_amount: 0,
        comment: '',
        fotos: [],
    },
});

export const compareCompletedNoMatches = responseFactory({
    ans_type: 18,
    signature: '',
    data: {
        id: 'x',
        client_id: 'FaceX/Test',
        reqID_serv: compareGUID,
        reqID_clnt: '2acc06a7-d25e-4294-9337-c4f3e07f4168',
        segment: '0',
        datetime: '2021-10-05 15:11:32',
        result_code: -7,
        results_amount: 0,
        comment: '',
        fotos: [],
    },
});

export const compareCompletedErrorComment = "He's dead, Jim";
export const compareCompletedError = responseFactory({
    ans_type: 18,
    signature: '',
    data: {
        id: 'x',
        client_id: 'FaceX/Test',
        reqID_serv: compareGUID,
        reqID_clnt: '920c1059-8120-483f-9942-3b7a06719d45',
        segment: '0',
        datetime: '2021-10-05 15:11:32',
        result_code: -10000,
        results_amount: 0,
        comment: compareCompletedErrorComment,
        fotos: [],
    },
});

export const compareCompletedSuccessProcessed: Record<string, number> = {
    '1': 93,
};

export const compareCompletedSuccess = responseFactory({
    ans_type: 18,
    signature: '',
    data: {
        id: 'x',
        client_id: 'FaceX/Test',
        reqID_serv: compareGUID,
        reqID_clnt: 'b65b750b-8f77-485a-b660-3895643a3453',
        segment: '0',
        datetime: '2021-10-05 15:11:32',
        result_code: 3,
        results_amount: 0,
        comment: compareCompletedErrorComment,
        fotos: [
            {
                par1: 0,
                par2: compareCompletedSuccessProcessed['1'],
                par3: 0,
                foto: '',
                namef: '1',
                namel: '',
                path: '',
            },
        ],
    },
});
