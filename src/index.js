import {addEventListeners, loadNodeURL} from './event-listeners';
import {getList, parseGetListResponse} from './api-interface';

window.onload = () => {
    getList('5eff5d2dfde52d0004ebd138', e => {
        const state = parseGetListResponse(e.target.response);
        addEventListeners(state);
        document.getElementById('showCompletedSwitch').checked = state.showCompleted;
        if (location.hash === '') {
            loadNodeURL(`#/${state.currentRootID}`, state);
        } else {
            loadNodeURL(location.hash, state);
        }
    });
}