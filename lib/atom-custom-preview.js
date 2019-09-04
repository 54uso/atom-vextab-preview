'use babel';

import { CompositeDisposable } from 'atom';
import url from 'url';

let AtomCustomPreviewView = require("./atom-custom-preview-view");

let fs = require("fs-plus");

export default {

  activate(state) {
    this.disposable = new CompositeDisposable();
    this.disposable.add(
      atom.commands.add("atom-workspace", {
        "atom-vextab-preview:toggle": () => this.toggle()
      })
    );
    this.disposable.add(
      atom.workspace.addOpener((uriToOpen) => this.onOpenUri(uriToOpen))
    );
  },

  onOpenUri(uriToOpen) {
    let protocol, host, filePath;
    try {
      const urlObjs = url.parse(uriToOpen);
      protocol = urlObjs.protocol;
      host = urlObjs.host;
      filePath = urlObjs.pathname;
      if (protocol !== 'atom-vextab-preview:') {
        return
      }
    } catch (error) {
      console.log(error);
      return
    }
    return new AtomCustomPreviewView({ editorId: filePath.substring(1) })
  },

  deactivate() {
    this.disposable.dispose();
  },

  toggle() {
    if (this.isAtomCustomPreviewView(atom.workspace.getActivePaneItem())) {
      atom.workspace.destroyActivePaneItem();
      return
    }
    const editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
      return
    }
    if (!this.removePreviewForEditor(editor)) {
      return this.addPreviewForEditor(editor)
    }
  },

  async addPreviewForEditor(editor) {
    if (editor && fs.isFileSync(editor.getPath())) {
      const uri = this.uriForEditor(editor);
      const options = {
        searchAllPanes: true,
        activatePane: false,
        split: 'right'
      };
      const atomCustomPreview = await atom.workspace.open(uri, options);
      if (this.isAtomCustomPreviewView(atomCustomPreview)) {
        atom.workspace.getActivePane().activate()
      }
    }
  },

  removePreviewForEditor (editor) {
    const uri = this.uriForEditor(editor);
    const previewPane = atom.workspace.paneForURI(uri);
    if (previewPane) {
      previewPane.destroyItem(previewPane.itemForURI(uri));
      return true
    }
    return false
  },

  uriForEditor(editor) {
    return `atom-vextab-preview://editor/${editor.id}`
  },

  isAtomCustomPreviewView(object) {
    return object instanceof AtomCustomPreviewView
  }

};
