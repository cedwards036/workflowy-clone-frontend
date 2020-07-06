import {addEventListeners, loadNodeURL} from './user-interface';
import {getList, parseGetListResponse} from './api-interface';

const LIST_ID = '5eff5d2dfde52d0004ebd138';

window.onload = () => {
    getList(LIST_ID, e => {
        const list = parseGetListResponse(e.target.response);
        addEventListeners(list);
        initializeShowCompletedSwitch(list);
        initializePage(list);
    });
}

function initializeShowCompletedSwitch(list) {
    document.getElementById('showCompletedSwitch').checked = list.showCompleted;
}

function initializePage(list) {
    if (location.hash === '') {
        loadNodeURL(`#/${list.currentRootID}`, list);
    } else {
        loadNodeURL(location.hash, list);
    }
}