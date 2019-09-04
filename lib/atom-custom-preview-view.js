'use babel';

import { Emitter, Disposable, CompositeDisposable, File } from 'atom'
import { $, $$$, View } from 'atom-space-pen-views'

vextab = require("vextab");
VexTab = vextab.VexTab;
Artist = vextab.Artist;
Renderer = vextab.Vex.Flow.Renderer;

export default class AtomCustomPreviewView extends View {

  static content() {
    this.div({ outlet: 'container', class: 'atom-vextab-preview', tabindex: -1, background: 'white' }, () => {
      this.div({id: "tabs", class: 'tags-preview' })
    })
  }

  static deserialize (state) {
    return new AtomCustomPreviewView(state)
  }

  constructor({editorId}) {
    super();
    this.editor = this.editorForId(editorId);
    this.disposables = new CompositeDisposable();
    this.zoomValue = 1
  }

  attached() {
    if (this.editor) {
      this.handleEvents();
      this.renderTabs()
    }
  }

  handleEvents() {
    const buffer = this.editor.getBuffer();
    this.disposables.add(
      //buffer.onDidReload(() => this.renderTabs()),
      //buffer.onDidStopChanging(() => this.renderTabs()),
      buffer.onDidSave(() => this.renderTabs())
    )
  }

  async renderTabs() {
    let source = await Promise.resolve(this.editor.getText());
    try {
      const canvas = document.createElement("canvas");
      renderer = new Renderer(canvas, Renderer.Backends.CANVAS);
      artist = new Artist(10, 10, 595, {scale: 0.8});
      vextab = new VexTab(artist);
      vextab.parse(source);
      artist.render(renderer);
      const tabs = document.getElementById('tabs');
      tabs.innerHTML = "";
      tabs.appendChild(canvas);
    } catch (e) {
        console.log(e);
    }
  }

  editorForId (editorId) {
    for (let editor of atom.workspace.getTextEditors()) {
      if (editor.id !== undefined && editor.id.toString() ===editorId.toString()) {
        return editor
      }
    }
    return null
  }

  getURI () {
    return `atom-vextab-preview://editor/${this.editor.id}`
  }

  getPath () {
    return this.editor.getPath()
  }

  serialize() {
    return {
      deserializer: 'CustomPreviewView',
      editorId: this.editor.id
    }
  }

  destroy() {
    this.disposables.dispose()
  }

  getElement() {
    return this.element;
  }

  getTitle() {
    let title = "Custom";
    if (this.editor) {
      title = this.editor.getTitle()
    }
    return `${title} Preview`
  }

}
