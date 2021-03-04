import classic from 'ember-classic-decorator';
import { alias } from '@ember/object/computed';
import Route from '@ember/routing/route';
import $ from 'jquery';
import ScrollTo from 'mdeditor/mixins/scroll-to';
import { defineProperty, action } from '@ember/object';

@classic
export default class IndexRoute extends Route.extend(ScrollTo) {
  setupController() {
    // Call _super for default behavior
    super.setupController(...arguments);

    this.controller.set('parentModel', this.modelFor('record.show.edit'));
    defineProperty(
      this.controller,
      'refreshSpy',
      alias('model.json.metadata.resourceDistribution.length')
    );
  }

  @action
  addDistribution() {
    let dists = this.currentRouteModel().get(
      'json.metadata.resourceDistribution'
    );

    dists.pushObject({});

    $('html, body').animate(
      {
        scrollTop: $(document).height(),
      },
      'slow'
    );
  }

  @action
  editDistributor(id, routeParams, scrollToId) {
    this.setScrollTo(scrollToId);
    this.transitionTo(
      'record.show.edit.distribution.distributor',
      routeParams,
      id
    );
  }

  @action
  deleteDistribution(id) {
    let dists = this.currentRouteModel().get(
      'json.metadata.resourceDistribution'
    );

    dists.removeAt(id);
  }
}