/**
 * Registers a "Hello World" custom tool with Unlayer.
 * Call from FormEditor's onReady with the editor instance.
 */
export function registerHelloWorldTool(editor: any): void {
  editor.registerTool({
    name: 'hello_world',
    label: 'Hello World',
    icon: 'fa-hand-paper-o',
    supportedDisplayModes: ['web', 'email'],
    options: {},
    values: {},
    renderer: {
      Viewer: editor.createViewer({
        render() {
          return '<div style="padding:12px;font-size:16px;">Hello World</div>'
        },
      }),
      exporters: {
        web: function () {
          return '<div style="padding:12px;font-size:16px;">Hello World</div>'
        },
        email: function () {
          return '<div style="padding:12px;font-size:16px;">Hello World</div>'
        },
      },
      head: {
        css: function () {},
        js: function () {},
      },
    },
    validator() {
      return []
    },
  })
}
