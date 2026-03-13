/**
 * Returns custom JS that registers the my_tool block in Unlayer.
 * Must run inside Unlayer's iframe (via options.customJS).
 * Note: customJS is a paid Unlayer feature; ensure your projectId has it enabled.
 */
export function getMyTool2JS(): string {
  return `(function(){unlayer.registerTool({
name: 'my_tool',
label: 'My Tool',
icon: 'fa-smile',
supportedDisplayModes: ['web', 'email'],
options: {},
values: {},
renderer: {
Viewer: unlayer.createViewer({
render(values) {
return '<div>I am a custom tool.</div>';
},
}),
exporters: {
web: function(_values) {
return '<div>I am a custom tool.</div>';
},
email: function(_values) {
return '<div>I am a custom tool.</div>';
},
},
head: {
css: function(_values) {},
js: function(_values) {},
},
},
validator(_data) {
return [];
},
});})()`;
}
