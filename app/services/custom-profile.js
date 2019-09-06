import Service from '@ember/service';
import {
  inject as service
} from '@ember/service';
//import request from 'ember-ajax/request';
//import { task, all, timeout } from 'ember-concurrency';
import { computed, get } from '@ember/object';
import { union, map } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
// import {
//   // isAjaxError,
//   isNotFoundError,
//   // isForbiddenError
// } from 'ember-ajax/errors';
// import semver from 'semver';
import config from 'mdeditor/config/environment';

const {
  APP: {
    defaultProfileId
  }
} = config;

//const fullId = 'org.adiwg.profile.full';

/**
 * Custom Profile service
 *
 * Service that provides custom profile configurations.
 *
 * @module
 * @augments ember/Service
 */
export default Service.extend({
  init() {
    this._super(...arguments);

    this.customProfiles = this.get('store').peekAll('custom-profile');
    //this.customProfiles = this.get('store').peekAll('custom-profile');
    // this.coreProfiles = this.definitions.coreProfiles.map(function (itm) {
    //   return {
    //     id: itm.namespace + '.' + itm.identifier,
    //     title: itm.title,
    //     description: itm.description,
    //     definition: itm
    //   }
    // });

  },
  flashMessages: service(),
  store: service(),
  definitions: service('profile'),

  /**
   * String identifying the active profile
   *
   * @type {?String}
   */
  active: null,

  profiles: union('customProfiles', 'coreProfiles'),
  coreProfiles: map('definitions.coreProfiles', function (itm) {
    return {
      id: itm.namespace + '.' + itm.identifier,
      title: itm.title,
      description: itm.description,
      definition: itm
    }
  }),
  mapById: computed('profiles.[]', function () {
    return this.profiles.reduce(function (map, profile) {
      map[profile.id] = profile;

      return map;
    }, {});
  }),
  mapByAltId: computed('profiles.[]', function () {
    return this.profiles.reduce(function (map, profile) {
      let alt = get(profile, 'definition.alternateId');

      if(isEmpty(alt)) {
        return map;
      }

      alt.forEach(a => map[a] = profile.id);

      return map;
    }, {});
  }),
  defaultProfile: computed('mapById', function () {
    return this.mapById[defaultProfileId];
  }),
  activeComponents: computed('active', function () {
    let comp = get(this.getActiveProfile(), 'definition.components');
    return comp || this.defaultProfile.definition.components;
  }),
  activeSchemas: computed('active', function () {
    return this.getActiveProfile().schemas;
  }),
  /**
   * Get the active profile.
   *
   * @function
   * @returns {Object}
   */
  getActiveProfile() {
    const active = this.active;
    const profile = active && typeof active === 'string' ? active :
      defaultProfileId;
    const selected = this.mapById[profile];

    if(selected) {
      return selected;
    }

    const alternate = this.mapById[this.mapByAltId[profile]];

    if(alternate) {
      this.flashMessages
        .info(
          `"${active}" identified as an alternate profile. Using "${alternate.title}" profile. To make this permanent, select "${alternate.title}" from the Profile list.`, {
            timeout: 7000
          }
        );

      return alternate;
    }

    this.flashMessages
      .warning(`Profile "${active}" not found. Using default profile.`);

    return this.defaultProfile;
  },

  // /**
  //  * An object defining the available profiles
  //  *
  //  * @type {Object} profiles
  //  */

  // fetchDefinition: task(function* (uri) {
  //   try {
  //     yield timeout(1000);
  //
  //     let response = yield request(uri);
  //
  //     if(response && !semver.valid(response.version)) {
  //       throw new Error("Invalid version");
  //     }
  //
  //     return response;
  //   } catch (error) {
  //     if(isNotFoundError(error)) {
  //       this.flashMessages
  //         .danger(
  //           `Could not load profile definition from ${uri}. Definition not found.`
  //         );
  //     } else {
  //       this.flashMessages
  //         .danger(
  //           `Could not load profile definition from "${uri}". Error: ${error.message}`
  //         );
  //     }
  //   }
  // }).drop(),

  // checkForUpdates: task(function* (records) {
  //   yield timeout(1000);
  //
  //   yield all(records.map(itm => {
  //     if(itm.validations.attrs.uri.isInvalid) {
  //       this.flashMessages
  //         .warning(
  //           `Did not load definition for "${itm.title}". URL is Invalid.`
  //         );
  //       return;
  //     }
  //
  //     return request(itm.uri).then(response => {
  //       // `response` is the data from the server
  //       if(semver.valid(response.version)) {
  //         itm.set('remoteVersion', response.version);
  //       } else {
  //         throw new Error("Invalid version");
  //       }
  //
  //       return response;
  //     }).catch(error => {
  //       if(isNotFoundError(error)) {
  //         this.flashMessages
  //           .danger(
  //             `Could not load definition for "${itm.title}". Definition not found.`
  //           );
  //       } else {
  //         this.flashMessages
  //           .danger(
  //             `Could not load definition for "${itm.title}". Error: ${error.message}`
  //           );
  //       }
  //     });
  //   }));
  // }).drop(),
});
