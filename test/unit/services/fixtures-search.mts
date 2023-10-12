import { type SearchStats, responseFactory } from '@myrotvorets/facex';
import type { MatchedFace, RecoginizedFace } from '../../../src/services/search.mjs';

export const searchGUID = '518e9c8d-22e3-46ee-a7b5-e4bb0bc4d99b';

export const searchUploadAck = responseFactory({
    ans_type: 33,
    signature: '',
    data: {
        id: 'x',
        client_id: 'C',
        reqID_serv: searchGUID,
        reqID_clnt: '987a3569-2e06-4e7b-88a6-17545d4f0b7b',
        segment: '0',
        datetime: '2023-09-27 14:16:20.607',
        result_code: 1,
        results_amount: 0,
        comment: 'AQ=0/BQ=0/CQ=1;',
        fotos: [],
    },
});

export const searchUploadError = responseFactory({
    ans_type: 34,
    signature: '',
    data: {
        id: 'x',
        client_id: 'C',
        reqID_serv: searchGUID,
        reqID_clnt: 'f020bb0f-90cb-4b42-b6ca-a4bb9ce0b3e3',
        segment: '0',
        datetime: '2023-09-27 14:16:20.607',
        result_code: -100,
        results_amount: 0,
        comment: 'Highly illogical',
        fotos: [],
    },
});

export const searchStatusInProgress = responseFactory({
    ans_type: 65,
    signature: '',
    data: {
        id: 'x',
        client_id: 'FaceX/Test',
        reqID_serv: searchGUID,
        reqID_clnt: '540da17f-aae9-4837-9c78-694316e98e7f',
        segment: '0',
        datetime: '27.09.2023 14:32:12',
        result_code: 2,
        results_amount: 0,
        comment: 'processing 9 sec',
        fotos: [],
    },
});

export const searchStatusFailed = responseFactory({
    ans_type: 66,
    signature: '',
    data: {
        id: 'x',
        client_id: 'FaceX/Test',
        reqID_serv: 'c239d3d4-69ce-41bb-a08b-2938cd23bfd0',
        reqID_clnt: 'bba77237-2d7f-4fec-ac41-c61bf25b333e',
        segment: '-1',
        datetime: '27.09.2023 14:40:35',
        result_code: 0,
        results_amount: 0,
        comment: 'error: id absent',
        fotos: [],
    },
});

export const searchStats: SearchStats[] = [{ faceID: 1512748, count: 21, confidence: 0 }];

export const searchStatusCompleted = responseFactory({
    ans_type: 67,
    signature: '',
    data: {
        id: 'x',
        client_id: 'FaceX/Test',
        reqID_serv: searchGUID,
        reqID_clnt: '109d67fc-2833-4d9d-835c-5c27ca55b54a',
        segment: '0',
        datetime: '27.09.2023 14:34:59',
        result_code: 3,
        results_amount: 1,
        comment: 'result ready',
        fotos: [
            {
                par1: searchStats[0]!.faceID,
                par2: searchStats[0]!.count,
                par3: searchStats[0]!.confidence,
                foto: null,
                namef: null,
                namel: null,
                path: null,
            },
        ],
    },
});

export const capturedFacesError = responseFactory({
    ans_type: 87,
    signature: '',
    data: {
        id: 'x',
        client_id: 'FaceX/Test',
        reqID_serv: 'c239d3d4-69ce-41bb-a08b-2938cd23bfd0',
        reqID_clnt: '6008194b-6630-4e1b-86fa-1777e26d7a8c',
        segment: '-1',
        datetime: '27.09.2023 14:50:50',
        result_code: 0,
        results_amount: 0,
        comment: 'error: id absent',
        fotos: [],
    },
});

export const recognizedFaces: RecoginizedFace[] = [
    {
        faceID: 1512748,
        minSimilarity: 16,
        maxSimilarity: 99,
        face: '/9j/',
    },
];

export const capturedFacesSuccess = responseFactory({
    ans_type: 80,
    signature: '',
    data: {
        id: 'x',
        client_id: 'FaceX/Test',
        reqID_serv: searchGUID,
        reqID_clnt: '3706e909-7ba3-42e3-b62b-fc42a6edc619',
        segment: '0',
        datetime: '27.09.2023 14:57:35',
        result_code: 3,
        results_amount: 1,
        comment: 'result ready',
        fotos: [
            {
                par1: recognizedFaces[0]!.faceID,
                par2: recognizedFaces[0]!.minSimilarity,
                par3: recognizedFaces[0]!.maxSimilarity,
                foto: recognizedFaces[0]!.face,
                namef: null,
                namel: null,
                path: null,
            },
        ],
    },
});

export const matchedFacesError = responseFactory({
    ans_type: 229,
    signature: '',
    data: {
        id: 'x',
        client_id: 'FaceX/Test',
        reqID_serv: 'c239d3d4-69ce-41bb-a08b-2938cd23bfd0',
        reqID_clnt: 'e2cec9d5-ad4b-462e-93a0-07b86c938791',
        segment: '-1',
        datetime: '27.09.2023 17:19:10',
        result_code: 3,
        results_amount: 0,
        comment: 'result ready', // the API is weird :-(
        fotos: [],
    },
});

export const matchedFaces: MatchedFace[] = [
    {
        similarity: 99,
        objname: '!1-0-1652658-1652698',
        face: '/9j/',
    },
];

export const matchedFacesSuccess = responseFactory({
    ans_type: 129,
    signature: '',
    data: {
        id: 'x',
        client_id: 'FaceX/Test',
        reqID_serv: searchGUID,
        reqID_clnt: 'c97c4291-ec78-48b7-b050-ad54e12c0047',
        segment: '0',
        datetime: '27.09.2023 17:26:45',
        result_code: recognizedFaces[0]!.faceID,
        results_amount: 1,
        comment: 'result ready', // the API is weird :-(
        fotos: [
            {
                par1: recognizedFaces[0]!.faceID,
                par2: 0,
                par3: matchedFaces[0]!.similarity,
                foto: matchedFaces[0]!.face,
                namef: '1-1143762',
                namel: matchedFaces[0]!.objname,
                path: `19:37:b2*${recognizedFaces[0]!.faceID}*0*`,
            },
        ],
    },
});
