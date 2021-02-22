import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { copy } from 'ember-copy';

@classic
export default class ShowRoute extends Route {
  @service
  flashMessages;

  model(params) {
    let rec = this.store.peekRecord('dictionary', params.dictionary_id);
    return rec;
  }

  afterModel(model) {
    const name = model.get('title');

    const crumb = {
      title: name,
    };

    this.set('breadCrumb', crumb);
  }

  @action
  destroyDictionary() {
    let model = this.currentRouteModel();
    model.destroyRecord().then(() => {
      this.flashMessages.success(`Deleted Dictionary: ${model.get('title')}`);
      this.replaceWith('dictionaries');
    });
  }

  @action
  copyDictionary() {
    this.flashMessages.success(
      `Copied Dictionary: ${this.currentRouteModel().get('title')}`
    );
    this.transitionTo('dictionary.new.id', copy(this.currentRouteModel()));
  }
}
