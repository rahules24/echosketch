/**
 * This is a modified version of the CommandManager.js adopted from Nebulnat-builder github repo.
 * https://github.com/Develatio/nebulant-builder/blob/master/src/core/CommandManager.js
 */
import { get } from "lodash-es";
import { mvc, util } from '@joint/core';
import DiffMatchPatch from "diff-match-patch";
import * as jsondiffpatch from "jsondiffpatch";

export default class CommandManager {
  constructor(options) {
    this.cm = new mvc.Model();
    this.graph = options.graph;
    this.shapes = this.graph.attributes.cells.cellNamespace;;
    this.stackLimit = options.stackLimit;
    this.initialSize = null;
    this.isResizing = false;
    this.differ = jsondiffpatch.create({
      arrays: {
        detectMove: true,
        includeValueOnMove: false,
      },
      textDiff: {
        diffMatchPatch: DiffMatchPatch,
        minLength: 100,
      },
      cloneDiffValues: true,
    });

      this.reset();
      this.listen();
  }

  on(event, fn) {
    this.cm.on(event, fn);
  }

  createCommand(options) {
    return {
      action: undefined,
      data: {
        id: undefined,
        type: undefined,
        diff: {},
      },
      batch: !!options?.batch,
    };
  }

  push(cmd) {
    this.redoStack = [];
    if (cmd.batch) {
      this._pushBatch(this.batchCommand, cmd);
      this.cm.trigger('batch', cmd);
    } else {
      this._push(this.undoStack, cmd);
      this.cm.trigger("stack:push");
    }
  }

  _pushBatch(stack, cmd) {
    if (!stack.length) {
      stack.push(cmd);
      return;
    }

    const prevCmd = stack.find(c => c.data.id === cmd.data.id && c.action === cmd.action);

    if (prevCmd === undefined) {
      stack.push(cmd);
      return;
    }

    if (cmd.action === "change:position") {
      if ("x" in cmd.data.diff.position) {
        prevCmd.data.diff.position.x ??= cmd.data.diff.position.x;
        prevCmd.data.diff.position.x[1] = cmd.data.diff.position.x[1];
      }

      if ("y" in cmd.data.diff.position) {
        prevCmd.data.diff.position.y ??= cmd.data.diff.position.y;
        prevCmd.data.diff.position.y[1] = cmd.data.diff.position.y[1];
      }

      return;
    }

    if (cmd.action === "change:target") {
      if ("magnet" in cmd.data.diff.target && "port" in cmd.data.diff.target) {
        stack.push(cmd);
        return;
      }

      if ("x" in cmd.data.diff.target) {
        prevCmd.data.diff.target.x ??= cmd.data.diff.target.x;
        prevCmd.data.diff.target.x[1] = cmd.data.diff.target.x[1];
      }

      if ("y" in cmd.data.diff.target) {
        prevCmd.data.diff.target.y ??= cmd.data.diff.target.y;
        prevCmd.data.diff.target.y[1] = cmd.data.diff.target.y[1];
      }

      return;
    }

    stack.push(cmd);
  }

  _push(stack, cmd) {
    stack.push(cmd);
    if (stack.length > this.stackLimit) {
      stack.splice(0, stack.length - this.stackLimit);
    }
  }

  listen() {
    this.cm.listenTo(this.graph, 'all', this.addCommand.bind(this));
    this.cm.listenTo(this.graph, 'batch:start', this.initBatchCommand.bind(this));
    this.cm.listenTo(this.graph, 'batch:stop', this.storeBatchCommand.bind(this));
    this.cm.listenTo(this.graph, 'reset', this.reset.bind(this));
    
    this.cm.listenTo(this.graph, 'element:mousepointerdown', (cellView) => {
      this.isResizing = true;
      this.initBatchCommand();
      
      // Capture the initial size
      this.initialSize = structuredClone(cellView.model.get('size'));
    });

    this.cm.listenTo(this.graph, 'element:mousepointerup', (cellView) => {
      if (this.isResizing) {
          this.isResizing = false;
          
          // Store the final size change command
          const finalSize = structuredClone(cellView.model.get('size'));
          const command = this.createCommand({ batch: true });
          command.action = 'change:size';
          command.data.id = cellView.model.id;
          command.data.type = cellView.model.attributes.type;
          command.data.diff.size = this.differ.diff(this.initialSize, finalSize);
          this.push(command);
          this.storeBatchCommand();
      }
    });
  }

  addCommand(cmdName, cell, _graph, options = {}) {
    if (options.dry) return;

    // Only handle specific command names
    if (!/^(?:add|remove|change:\w+)$/.test(cmdName)) return;
    if (options?.skip_undo_stack === true) return;


    /**
     * 
     * This we are already tackling, above my batching all the changes while drawing.
     * TODO: Check, if this code is required or not
     * 
     */
    // Skip all intermediate size changes while resizing
    if (cmdName === 'change:size' && this.isResizing) return;



    let command = this.batchCommand
        ? this.createCommand({ batch: true })
        : this.createCommand({ batch: false });

    if (cmdName === 'add' || cmdName === 'remove') {
        command.action = cmdName;
        command.data.id = cell.id;
        command.data.type = cell.attributes.type;

        const attrs = cell.toJSON()
        const isLink = cell.isLink();
        
        command.data.attributes = util.merge({...cell, markup: cell.get('markup')}, 
            {
              ...attrs,
            ...(!isLink && { position: attrs.position }),
            ...(isLink && { connector: attrs.connector }),
            ...(isLink && { router: attrs.router }),
            ...(isLink && { source: attrs.source }),
            ...(isLink && { target: attrs.target }),
        });

        this.push(command);
        return;
    }

    const changedAttribute = cmdName.split("change:")[1];

    if (!command.batch || !command.action) {
        command.action = cmdName;
        command.data.id = cell.id;
        command.data.type = cell.attributes.type;
    }

    command.data.diff[changedAttribute] = this.differ.diff(
        cell.previous(changedAttribute),
        cell.get(changedAttribute)
    );

    this.push(command);
  }
  
  initBatchCommand() {
    if (!this.batchCommand) {
      this.batchCommand = [];
      this.batchLevel = 0;
    } else {
      this.batchLevel++;
    }
  }
  
  storeBatchCommand() {
    if (this.batchCommand && this.batchLevel <= 0) {
      if (this.batchCommand.length > 0) {
        this.redoStack = [];
        this._push(this.undoStack, this.batchCommand);
        this.cm.trigger("stack:push");
        this.cm.trigger('add', this.batchCommand);
      }
  
      this.batchCommand = null;
      this.batchLevel = null;
    } else if (this.batchCommand && this.batchLevel > 0) {
      this.batchLevel--;
    }
  }  

  _createNodeAttrsFromPatch(cmd) {
    const shapeCls = get(this.shapes, cmd.data.type);
    let node = null;
    const attributes = cmd.data.attributes.attributes;

    // Conditionally instantiate based on type
    if (attributes.type === "AOPelements") {
        node = shapeCls.create(
            attributes.label?.fontFamily || 'Arial',
            attributes.elementtype,
            attributes.attrs.border.stroke,
            attributes.attrs.pointers.fill,
            attributes.attrs.roughRef.current,
            attributes.attrs.body.stroke,
            attributes.attrs.styleRef.current
        );
    }
    if (attributes.type === "RoughLink") {
      node = new this.shapes.RoughLink({
            source: attributes.source,
            target: attributes.target,
            connector: attributes.connector,
            attrs: attributes.attrs,
            id: attributes.id,
            z: attributes.z
      });
    }

    // Apply settings structure if necessary
    if (node && node.enforceSettingsStructure) {
        node.enforceSettingsStructure();
    }

    // Merge node attributes for consistency
    const attrs = util.merge(
        node.toJSON(),
        attributes
    );

    node.remove(); // Clean up
    return attrs;
  }

  _patchNodeAttrs(model, cmd, patchDirection) {
    const attribute = cmd.action.split("change:")[1];
    const data = model? structuredClone(model.get(attribute)) : {};
    const diff = cmd.data.diff[attribute];

    return [attribute, patchDirection === "forward"
      ? this.differ.patch(data, diff)
      : this.differ.unpatch(data, diff)
    ];
  }

  revertCommand(command) {
    this.cm.stopListening();

    [].concat(command).reverse().forEach(cmd => {
      const model = this.graph.getCell(cmd.data.id);

      if (cmd.action === "add") {
        if (model) model.remove();
      } else if (cmd.action === "remove") {
        const attrs = this._createNodeAttrsFromPatch(cmd);
        this.graph.addCell(attrs);
      } else {
        const [attribute, patch] = this._patchNodeAttrs(model, cmd, "backward");
        if (model) model.set(attribute, patch);
      }
    });

    this.listen();
  }

  applyCommand(command) {
    this.cm.stopListening();

    [].concat(command).forEach(cmd => {
      const model = this.graph.getCell(cmd.data.id);

      if (cmd.action === "add") {
        const attrs = this._createNodeAttrsFromPatch(cmd);
        this.graph.addCell(attrs);
      } else if (cmd.action === "remove" && model) {
        model.remove();
        this.redoStack.push(command);
      } else {
        const [attribute, patch] = this._patchNodeAttrs(model, cmd, "forward");
        if (model) model.set(attribute, patch);
      }
    });

    this.listen();
  }

  undo() {
    const command = this.undoStack.pop();
    if (command) {
      this.revertCommand(command);
      this.redoStack.push(command);
    }
  }

  redo() {
    const command = this.redoStack.pop();
    if (command) {
      this.applyCommand(command);
      this.undoStack.push(command); 
    }
  }

  cancel() {
    const command = this.undoStack.pop();
    if (command) {
      this.revertCommand(command);
      this.redoStack = [];
    }
  }

  reset() {
    this.undoStack = [];
    this.redoStack = [];
  }

  hasUndo() {
    return this.undoStack.length > 0;
  }

  hasRedo() {
    return this.redoStack.length > 0;
  }

  toJSON() {
    return {
      undo: structuredClone(this.undoStack),
      redo: structuredClone(this.redoStack),
    };
  }

  fromJSON(json) {
    this.undoStack = structuredClone(json.undo);
    this.redoStack = structuredClone(json.redo);
  }
}