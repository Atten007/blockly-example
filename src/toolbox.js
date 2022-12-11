  8,371 
examples/sample-app/package-lock.json
  

 
Load diff
Large diffs are not rendered by default.

   28 
examples/sample-app/package.json
  

@@ -0,0 +1,28 @@
 {
   "name": "sample-app",
   "version": "1.0.0",
   "description": "A sample app using Blockly",
   "main": "index.js",
   "private": true,
   "scripts": {
     "test": "echo \"Error: no test specified\" && exit 1",
     "build": "webpack",
     "start": "webpack serve --open"
   },
   "keywords": [
     "blockly"
   ],
   "author": "Blockly team",
   "license": "Apache-2.0",
   "devDependencies": {
     "css-loader": "^6.7.1",
     "html-webpack-plugin": "^5.5.0",
     "style-loader": "^3.3.1",
     "webpack": "^5.74.0",
     "webpack-cli": "^4.10.0",
     "webpack-dev-server": "^4.11.1"
   },
   "dependencies": {
     "blockly": "^9.1.0"
   }
 }
  32 
examples/sample-app/src/blocks/text.js
 
@@ -0,0 +1,32 @@
 import * as Blockly from 'blockly/core';

@rachel-fenichel rachel-fenichel 4 days ago
For all js files: add license tags.
 @Atten007	Reply...

 // Create a custom block called 'add_text' that adds
 // text to the output div on the sample app.
 // This is just an example and you should replace this with your
 // own custom blocks.
 const addText = {
   'type': 'add_text',
   'message0': 'Add text %1 with color %2',
   'args0': [
     {
       'type': 'input_value',
       'name': 'TEXT',
       'check': 'String',
     },
     {
       'type': 'input_value',
       'name': 'COLOR',
       'check': 'Colour',
     },
   ],
   'previousStatement': null,
   'nextStatement': null,
   'colour': 160,
   'tooltip': '',
   'helpUrl': '',
 };

 // Create the block definitions for the JSON-only blocks.
 // This does not register their definitions with Blockly.

@rachel-fenichel rachel-fenichel 4 days ago
Also add (here or at the top of the file) "This file has no side effects" to echo your comment in generators.
 @Atten007	Reply...
 export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray(
     [addText]);
  28 
examples/sample-app/src/generators/javascript.js
 
@@ -0,0 +1,28 @@
 import {javascriptGenerator} from 'blockly/javascript';

 // Export all the code generators for our custom blocks,
 // but don't register them with Blockly yet.
 // This file has no side effects!
 export const generator = Object.create(null);

 generator['add_text'] = function(block) {
   const text = javascriptGenerator.valueToCode(block, 'TEXT',
       javascriptGenerator.ORDER_NONE) || '\'\'';
   const color = javascriptGenerator.valueToCode(block, 'COLOR',
       javascriptGenerator.ORDER_ATOMIC) || '\'#ffffff\'';

   const addText = javascriptGenerator.provideFunction_(
       'addText',
       ['function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
           '(text, color) {',
       '  // Add text to the output area.',
       '  const outputDiv = document.getElementById(\'output\');',
       '  const textEl = document.createElement(\'p\');',
       '  textEl.innerText = text;',
       '  textEl.style.color = color;',
       '  outputDiv.appendChild(textEl);',
       '}']);
     // Generate the function call for this block.
   const code = `${addText}(${text}, ${color});\n`;
   return code;
 };
  39 
examples/sample-app/src/index.css
 
@@ -0,0 +1,39 @@
 body {
     margin: 0;
     max-width: 100vw;
 }

 pre, code {
     overflow: auto;
 }

 #pageContainer {
     display: flex;
     width: 100%;
     max-width: 100vw;
     height: 100vh;
 }

 #blocklyDiv {
     flex-basis: 100%;
     height: 100%;
     min-width: 600px;
 }

 #outputPane {
     display: flex;
     flex-direction: column;
     width: 400px;
     flex: 0 0 400px;
     overflow: auto;
     margin: 1rem;
 }

 #generatedCode {
     height: 50%;
     background-color: rgb(247, 240, 228);
 }

 #output {
     height: 50%;
 }
  16 
examples/sample-app/src/index.html
 
@@ -0,0 +1,16 @@
 <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Blockly Sample App</title>
    </head>
    <body>
     <div id="pageContainer">
       <div id="outputPane">
         <pre id="generatedCode"><code></code></pre>
         <div id="output"></div>
       </div>
       <div id="blocklyDiv"></div>
     </div>    
    </body>
  </html>
  56 
examples/sample-app/src/index.js
 
@@ -0,0 +1,56 @@
 import * as Blockly from 'blockly';
 import {blocks} from './blocks/text';
 import {generator} from './generators/javascript';
 import {javascriptGenerator} from 'blockly/javascript';
 import {save, load} from './serialization';
 import {toolbox} from './toolbox';
 import './index.css';

 // Register the blocks and generator with Blockly
 Blockly.common.defineBlocks(blocks);
 Object.assign(javascriptGenerator, generator);

 // Set up UI elements and inject Blockly
 const codeDiv = document.getElementById('generatedCode').firstChild;
 const outputDiv = document.getElementById('output');
 const blocklyDiv = document.getElementById('blocklyDiv');
 const ws = Blockly.inject(blocklyDiv, {toolbox});

 // This function resets the code and output divs, shows the
 // generated code from the workspace, and evals the code.
 // In a real application, you probably shouldn't use `eval`.
 const runCode = () => {
   const code = javascriptGenerator.workspaceToCode(ws);
   codeDiv.innerText = code;

   outputDiv.innerHTML = '';

   eval(code);
 };

 // Load the initial state from storage and run the code.
 load(ws);
 runCode();

 // Every time the workspace changes state, save the changes to storage.
 ws.addChangeListener((e) => {
   // UI events are things like scrolling, zooming, etc.
   // No need to save after one of these.
   if (e.isUiEvent) return;
   save(ws);
 });


 // Whenever the workspace changes meaningfully, run the code again.
 ws.addChangeListener((e) => {
   // Don't run the code when the workspace finishes loading; we're
   // already running it once when the application starts.
   // Don't run the code during drags; we might have invalid state.
   if (e.isUiEvent || e.type == Blockly.Events.FINISHED_LOADING ||
     ws.isDragging()) {
     return;
   }
   runCode();
 });


  26 
examples/sample-app/src/serialization.js
 
@@ -0,0 +1,26 @@
 import * as Blockly from 'blockly/core';

 const storageKey = 'mainWorkspace';

 /**
  * Saves the state of the workspace to browser's local storage.
  * @param {Blockly.Workspace} workspace Blockly workspace to save.
  */
 export const save = function(workspace) {
   const data = Blockly.serialization.workspaces.save(workspace);
   window.localStorage?.setItem(storageKey, JSON.stringify(data));
 };

 /**
  * Loads saved state from local storage into the given workspace.
  * @param {Blockly.Workspace} workspace Blockly workspace to load into.
  */
 export const load = function(workspace) {
   const data = window.localStorage?.getItem(storageKey);
   if (!data) return;

   // Don't emit events during loading.
   Blockly.Events.disable();
   Blockly.serialization.workspaces.load(JSON.parse(data), workspace, false);
   Blockly.Events.enable();
 };
  710 
examples/sample-app/src/toolbox.js
 
@@ -0,0 +1,710 @@
 /*
 This toolbox contains nearly every single built-in block that Blockly offers,
 in addition to the custom block 'add_text' this sample app adds.
 You probably don't need every single block, and should consider either rewriting
 your toolbox from scratch, or carefully choosing whether you need each block
 listed here.
 */

 export const toolbox = {
   'kind': 'categoryToolbox',
   'contents': [
     {
       'kind': 'category',
       'name': 'Logic',
       'categorystyle': 'logic_category',
       'contents': [
         {
           'kind': 'block',
           'type': 'controls_if',
         },
         {
           'kind': 'block',
           'type': 'logic_compare',
         },
         {
           'kind': 'block',
           'type': 'logic_operation',
         },
         {
           'kind': 'block',
           'type': 'logic_negate',
         },
         {
           'kind': 'block',
           'type': 'logic_boolean',
         },
         {
           'kind': 'block',
           'type': 'logic_null',
         },
         {
           'kind': 'block',
           'type': 'logic_ternary',
         },
       ],
     },
     {
       'kind': 'category',
       'name': 'Loops',
       'categorystyle': 'loop_category',
       'contents': [
         {
           'kind': 'block',
           'type': 'controls_repeat_ext',
           'inputs': {
             'TIMES': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 10,
                 },
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'controls_whileUntil',
         },
         {
           'kind': 'block',
           'type': 'controls_for',
           'inputs': {
             'FROM': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 1,
                 },
               },
             },
             'TO': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 10,
                 },
               },
             },
             'BY': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 1,
                 },
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'controls_forEach',
         },
         {
           'kind': 'block',
           'type': 'controls_flow_statements',
         },
       ],
     },
     {
       'kind': 'category',
       'name': 'Math',
       'categorystyle': 'math_category',
       'contents': [
         {
           'kind': 'block',
           'type': 'math_number',
           'fields': {
             'NUM': 123,
           },
         },
         {
           'kind': 'block',
           'type': 'math_arithmetic',
           'inputs': {
             'A': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 1,
                 },
               },
             },
             'B': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 1,
                 },
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'math_single',
           'inputs': {
             'NUM': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 9,
                 },
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'math_trig',
           'inputs': {
             'NUM': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 45,
                 },
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'math_constant',
         },
         {
           'kind': 'block',
           'type': 'math_number_property',
           'inputs': {
             'NUMBER_TO_CHECK': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 0,
                 },
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'math_round',
           'fields': {
             'OP': 'ROUND',
           },
           'inputs': {
             'NUM': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 3.1,
                 },
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'math_on_list',
           'fields': {
             'OP': 'SUM',
           },
         },
         {
           'kind': 'block',
           'type': 'math_modulo',
           'inputs': {
             'DIVIDEND': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 64,
                 },
               },
             },
             'DIVISOR': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 10,
                 },
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'math_constrain',
           'inputs': {
             'VALUE': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 50,
                 },
               },
             },
             'LOW': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 1,
                 },
               },
             },
             'HIGH': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 100,
                 },
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'math_random_int',
           'inputs': {
             'FROM': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 1,
                 },
               },
             },
             'TO': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 100,
                 },
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'math_random_float',
         },
         {
           'kind': 'block',
           'type': 'math_atan2',
           'inputs': {
             'X': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 1,
                 },
               },
             },
             'Y': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 1,
                 },
               },
             },
           },
         },
       ],
     },
     {
       'kind': 'category',
       'name': 'Text',
       'categorystyle': 'text_category',
       'contents': [
         {
           'kind': 'block',
           'type': 'text',
         },
         {
           'kind': 'block',
           'type': 'text_multiline',
         },
         {
           'kind': 'block',
           'type': 'text_join',
         },
         {
           'kind': 'block',
           'type': 'text_append',
           'inputs': {
             'TEXT': {
               'shadow': {
                 'type': 'text',
                 'fields': {
                   'TEXT': '',
                 },
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'text_length',
           'inputs': {
             'VALUE': {
               'shadow': {
                 'type': 'text',
                 'fields': {
                   'TEXT': 'abc',
                 },
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'text_isEmpty',
           'inputs': {
             'VALUE': {
               'shadow': {
                 'type': 'text',
                 'fields': {
                   'TEXT': '',
                 },
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'text_indexOf',
           'inputs': {
             'VALUE': {
               'block': {
                 'type': 'variables_get',
               },
             },
             'FIND': {
               'shadow': {
                 'type': 'text',
                 'fields': {
                   'TEXT': 'abc',
                 },
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'text_charAt',
           'inputs': {
             'VALUE': {
               'block': {
                 'type': 'variables_get',
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'text_getSubstring',
           'inputs': {
             'STRING': {
               'block': {
                 'type': 'variables_get',
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'text_changeCase',
           'inputs': {
             'TEXT': {
               'shadow': {
                 'type': 'text',
                 'fields': {
                   'TEXT': 'abc',
                 },
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'text_trim',
           'inputs': {
             'TEXT': {
               'shadow': {
                 'type': 'text',
                 'fields': {
                   'TEXT': 'abc',
                 },
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'text_count',
           'inputs': {
             'SUB': {
               'shadow': {
                 'type': 'text',
               },
             },
             'TEXT': {
               'shadow': {
                 'type': 'text',
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'text_replace',
           'inputs': {
             'FROM': {
               'shadow': {
                 'type': 'text',
               },
             },
             'TO': {
               'shadow': {
                 'type': 'text',
               },
             },
             'TEXT': {
               'shadow': {
                 'type': 'text',
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'text_reverse',
           'inputs': {
             'TEXT': {
               'shadow': {
                 'type': 'text',
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'add_text',
           'inputs': {
             'TEXT': {
               'shadow': {
                 'type': 'text',
                 'fields': {
                   'TEXT': 'abc',
                 },
               },
             },
             'COLOR': {
               'shadow': {
                 'type': 'colour_picker',
                 'fields': {
                   'COLOUR': '#aa00cc',
                 },
               },
             },
           },
         },
       ],
     },
     {
       'kind': 'category',
       'name': 'Lists',
       'categorystyle': 'list_category',
       'contents': [
         {
           'kind': 'block',
           'type': 'lists_create_with',
         },
         {
           'kind': 'block',
           'type': 'lists_create_with',
         },
         {
           'kind': 'block',
           'type': 'lists_repeat',
           'inputs': {
             'NUM': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 5,
                 },
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'lists_length',
         },
         {
           'kind': 'block',
           'type': 'lists_isEmpty',
         },
         {
           'kind': 'block',
           'type': 'lists_indexOf',
           'inputs': {
             'VALUE': {
               'block': {
                 'type': 'variables_get',
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'lists_getIndex',
           'inputs': {
             'VALUE': {
               'block': {
                 'type': 'variables_get',
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'lists_setIndex',
           'inputs': {
             'LIST': {
               'block': {
                 'type': 'variables_get',
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'lists_getSublist',
           'inputs': {
             'LIST': {
               'block': {
                 'type': 'variables_get',
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'lists_split',
           'inputs': {
             'DELIM': {
               'shadow': {
                 'type': 'text',
                 'fields': {
                   'TEXT': ',',
                 },
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'lists_sort',
         },
         {
           'kind': 'block',
           'type': 'lists_reverse',
         },
       ],
     },
     {
       'kind': 'category',
       'name': 'Color',
       'categorystyle': 'colour_category',
       'contents': [
         {
           'kind': 'block',
           'type': 'colour_picker',
         },
         {
           'kind': 'block',
           'type': 'colour_random',
         },
         {
           'kind': 'block',
           'type': 'colour_rgb',
           'inputs': {
             'RED': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 100,
                 },
               },
             },
             'GREEN': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 50,
                 },
               },
             },
             'BLUE': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 0,
                 },
               },
             },
           },
         },
         {
           'kind': 'block',
           'type': 'colour_blend',
           'inputs': {
             'COLOUR1': {
               'shadow': {
                 'type': 'colour_picker',
                 'fields': {
                   'COLOUR': '#ff0000',
                 },
               },
             },
             'COLOUR2': {
               'shadow': {
                 'type': 'colour_picker',
                 'fields': {
                   'COLOUR': '#3333ff',
                 },
               },
             },
             'RATIO': {
               'shadow': {
                 'type': 'math_number',
                 'fields': {
                   'NUM': 0.5,
                 },
               },
             },
           },
         },
       ],
     },
     {
       'kind': 'sep',
     },
     {
       'kind': 'category',
       'name': 'Variables',
       'categorystyle': 'variable_category',
       'custom': 'VARIABLE',
     },
     {
       'kind': 'category',
       'name': 'Functions',
       'categorystyle': 'procedure_category',
       'custom': 'PROCEDURE',
     },
   ],
 };
