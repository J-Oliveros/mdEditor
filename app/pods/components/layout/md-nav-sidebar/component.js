import classic from 'ember-classic-decorator';
import { action, computed } from '@ember/object';
import { tagName, classNameBindings, classNames } from '@ember-decorators/component';
import Component from '@ember/component';
import config from 'mdeditor/config/environment';
import $ from 'jquery';

@classNameBindings('showHelp:help')
@classNames('md-sidebar-wrapper')
@tagName('div')
@classic
export default class MdNavSidebar extends Component {
  showHelp = false;

  @computed
  get prerelease() {
    let version = this.version;

    if(version.substring(0, 3) === "0.0"){
      return 'alpha';
    }

    if(version.substring(0, 1) === "0" && version.substring(0, 3) >0){
      return 'beta';
    }
  }

  @computed
  get version() {
    let version = config.APP.version;

    return version.substring(0, version.indexOf('+'));
  }

  @action
  toggleHelp() {
    this.toggleProperty('showHelp');
  }

  @action
  toggleSidebar() {
    $('#md-wrapper')
      .toggleClass('toggled');
    //hack to force reflow
    $('#md-navbar-main-collapse ul')
      .hide()
      .show(0);
  }
}
