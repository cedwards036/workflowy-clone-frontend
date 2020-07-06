import assert from 'assert';
import NodeCollection from '../src/node-collection';
import Node from '../src/node';
import {parseGetListResponse} from '../src/api-interface';

describe('parseGetListResponse', () => {
    it('creates node objects for each node in the list and adds them to the colleciton', () => {
        const response = {
            "_id": "5eff5d2dfde52d0004ebd138",
            "created_at": "2020-07-03T16:30:37.254Z",
            "show_completed": false,
            "updated_at": "2020-07-03T16:30:37.254Z",
            "root_node_id": "5eff5d2dfde52d0004ebd139",
            "nodes": [
                {
                    "_id": "5eff5d2dfde52d0004ebd139",
                    "completed": false,
                    "created_at": "2020-07-03T16:30:37.285Z",
                    "expanded": true,
                    "list_id": "5eff5d2dfde52d0004ebd138",
                    "parent_list_id": "5eff5d2dfde52d0004ebd138",
                    "parent_node_id": null,
                    "tag_ids": ["8448jfjf4"],
                    "text": "My List",
                    "updated_at": "2020-07-03T16:30:37.313Z",
                    "tag_names": ["tag3"],
                    "child_ids": ["fj8j983j9g8j938j9gj3"]
                },
                {
                    "_id": "fj8j983j9g8j938j9gj3",
                    "completed": true,
                    "created_at": "2020-07-03T16:30:37.285Z",
                    "expanded": false,
                    "list_id": "5eff5d2dfde52d0004ebd138",
                    "parent_list_id": "5eff5d2dfde52d0004ebd138",
                    "parent_node_id": "5eff5d2dfde52d0004ebd139",
                    "tag_ids": ["f982j983", "fj8j928jt2"],
                    "text": "get groceries",
                    "updated_at": "2020-07-03T16:30:37.313Z",
                    "tag_names": ["tag1", "tag2"],
                    "child_ids": []
                }
            ],
            "tag_names": ["tag1", "tag2", "tag3"]
        }
        const expectedCollection = NodeCollection()
                                    .add(Node({
                                        id: "5eff5d2dfde52d0004ebd139",
                                        text: "My List",
                                        isCompleted: false,
                                        isExpanded: true,
                                        tags: ["tag3"],
                                        childIDs: ["fj8j983j9g8j938j9gj3"],
                                        parentID: null
                                    }))
                                    .add(Node({
                                        id: "fj8j983j9g8j938j9gj3",
                                        text: "get groceries",
                                        isCompleted: true,
                                        isExpanded: false,
                                        tags: ["tag1", "tag2"],
                                        childIDs: [],
                                        parentID: "5eff5d2dfde52d0004ebd139"
                                    }));
        const expected = {
            nodeCollection: expectedCollection,
            showCompleted: false,
            currentRootID: "5eff5d2dfde52d0004ebd139",
            tags: ['tag1', 'tag2', 'tag3'],
            listID: '5eff5d2dfde52d0004ebd138'
        }
        assert.deepStrictEqual(parseGetListResponse(response), expected);
    });
});