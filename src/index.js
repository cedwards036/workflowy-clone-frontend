import {addEventListeners, loadNodeURL} from './event-listeners';
import {getList, parseGetListResponse} from './api-interface';

window.onload = () => {
    getList('5eff5d2dfde52d0004ebd138', e => {
        const list = parseGetListResponse(e.target.response);
        addEventListeners(list);
        document.getElementById('showCompletedSwitch').checked = list.showCompleted;
        if (location.hash === '') {
            loadNodeURL(`#/${list.currentRootID}`, list);
        } else {
            loadNodeURL(location.hash, list);
        }
    });
}