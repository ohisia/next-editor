import { makeAutoObservable } from 'mobx';
import { getState, setState, subscribe } from '../../../../store/shared-state';

class SharedStateStore {
  constructor() {
    makeAutoObservable(this);
    subscribe((newState) => {
      this.state = newState;
    });
  }

  state = getState();

  updateState(updater) {
    setState(updater(getState()));
  }
}

export default new SharedStateStore();

export const updateState = (updater) => {
  setState(updater(getState()))
}