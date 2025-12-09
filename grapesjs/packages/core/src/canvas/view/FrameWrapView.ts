import { bindAll, isNumber, isNull, debounce } from 'underscore';
import { ModuleView } from '../../abstract';
import FrameView from './FrameView';
import { createEl, removeEl } from '../../utils/dom';
import Dragger from '../../utils/Dragger';
import CanvasView from './CanvasView';
import Frame from '../model/Frame';

export default class FrameWrapView extends ModuleView<Frame> {
  events() {
    return {
      'click [data-action-remove]': 'remove',
      'mousedown [data-action-move]': 'startDrag',
    };
  }
  elTools?: HTMLElement;
  frame: FrameView;
  dragger?: Dragger;
  cv: CanvasView;
  classAnim: string;
  sizeObserver?: ResizeObserver;
  mutationObserver?: MutationObserver;

  constructor(model: Frame, canvasView: CanvasView) {
    super({ model });
    bindAll(this, 'onScroll', 'frameLoaded', 'updateOffset', 'remove', 'startDrag');
    const config = {
      ...model.config,
      frameWrapView: this,
    };
    this.cv = canvasView;
    this.frame = new FrameView(model, this);
    this.classAnim = `${this.ppfx}frame-wrapper--anim`;
    this.updateOffset = debounce(this.updateOffset.bind(this), 0);
    this.updateSize = debounce(this.updateSize.bind(this), 0);
    this.listenTo(model, 'loaded', this.frameLoaded);
    this.listenTo(model, 'change:x change:y', this.updatePos);
    this.listenTo(model, 'change:width change:height', this.updateSize);
    this.listenTo(model, 'destroy remove', this.remove);
    this.updatePos();
    this.setupDragger();
  }

  setupDragger() {
    const { module, model } = this;
    let dragX: number, dragY: number, zoom: number;
    const toggleEffects = (on: boolean) => {
      module.toggleFramesEvents(on);
    };

    this.dragger = new Dragger({
      onStart: () => {
        const { x, y } = model.attributes;
        zoom = this.em.getZoomMultiplier();
        dragX = x;
        dragY = y;
        toggleEffects(false);
      },
      onEnd: () => toggleEffects(true),
      setPosition: (posOpts: any) => {
        model.set({
          x: dragX + posOpts.x * zoom,
          y: dragY + posOpts.y * zoom,
        });
      },
    });
  }

  startDrag(ev?: Event) {
    ev && this.dragger?.start(ev);
  }

  __clear(opts?: any) {
    const { frame } = this;
    frame && frame.remove(opts);
    removeEl(this.elTools);
  }

  remove(opts?: any) {
    this.sizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    this.__clear(opts);
    ModuleView.prototype.remove.apply(this, opts);
    //@ts-ignore
    ['frame', 'dragger', 'cv', 'elTools'].forEach((i) => (this[i] = 0));
    return this;
  }

  updateOffset() {
    const { em, $el, frame } = this;
    if (!em || em.destroyed) return;
    em.runDefault({ preserveSelected: 1 });
    $el.removeClass(this.classAnim);
    frame?.model?._emitUpdated();
  }

  updatePos(md?: boolean) {
    const { model, el } = this;
    const { x, y } = model.attributes;
    const { style } = el;
    this.frame.rect = undefined;
    style.left = isNaN(x) ? x : `${x}px`;
    style.top = isNaN(y) ? y : `${y}px`;
    md && this.updateOffset();
  }

  updateSize() {
    this.updateDim();
  }

  /**
   * Update dimensions of the frame
   * @private
   */
  updateDim() {
    const { em, el, $el, model, classAnim, frame } = this;
    if (!frame) return;
    frame.rect = undefined;
    $el.addClass(classAnim);
    const { noChanges, width, height } = this.__handleSize();

    // Set width and height from DOM (should be done only once)
    if (isNull(width) || isNull(height)) {
      model.set(
        {
          ...(!width ? { width: el.offsetWidth } : {}),
          ...(!height ? { height: el.offsetHeight } : {}),
        },
        { silent: 1 },
      );
    }

    // Prevent fixed highlighting box which appears when on
    // component hover during the animation
    em.stopDefault({ preserveSelected: 1 });
    noChanges ? this.updateOffset() : setTimeout(this.updateOffset, 350);
  }

  onScroll() {
    const { frame, em } = this;
    em.trigger('frame:scroll', {
      frame,
      body: frame.getBody(),
      target: frame.getWindow(),
    });
  }

  frameLoaded() {
    const { frame, config } = this;
    frame.getWindow().onscroll = this.onScroll;
    this.updateDim();
  }

  __handleSize() {
    const un = 'px';
    const { model, el } = this;
    const { style } = el;
    const { width, height } = model.attributes;
    const currW = style.width || '';
    const currH = style.height || '';
    const newW = width || '';
    const newH = height || '';
    const noChanges = currW == newW && currH == newH;
    const newWidth = isNumber(newW) ? `${newW}${un}` : newW;
    const newHeight = isNumber(newH) ? `${newH}${un}` : newH;
    style.width = newWidth;
    this.sizeObserver?.disconnect();
    this.mutationObserver?.disconnect();

    if (model.hasAutoHeight()) {
      const iframe = this.frame.el;
      const { contentDocument } = iframe;

      if (contentDocument) {
        const minHeight = parseFloat(model.get('minHeight')) || 0;
        let isUpdating = false;
        let lastHeight = 0;
        
        // Helper function to calculate actual content height
        // Uses offsetTop + offsetHeight to get true content height (not affected by scroll position)
        // This avoids the scrollHeight issue where it doesn't shrink when content is removed
        const getContentHeight = (): number => {
          const body = contentDocument.body;
          if (!body || !body.children.length) return minHeight;
          
          let maxBottom = 0;
          // Calculate the bottom-most point of all direct children using offset properties
          // offsetTop and offsetHeight are relative to the document, not viewport
          for (let i = 0; i < body.children.length; i++) {
            const child = body.children[i] as HTMLElement;
            if (child && typeof child.offsetTop === 'number' && typeof child.offsetHeight === 'number') {
              const childBottom = child.offsetTop + child.offsetHeight;
              if (childBottom > maxBottom) {
                maxBottom = childBottom;
              }
            }
          }
          
          // Add body margin/padding if any
          const bodyStyle = contentDocument.defaultView?.getComputedStyle(body);
          const bodyMargin = bodyStyle ? (parseFloat(bodyStyle.marginTop) || 0) + (parseFloat(bodyStyle.marginBottom) || 0) : 0;
          const bodyPadding = bodyStyle ? (parseFloat(bodyStyle.paddingTop) || 0) + (parseFloat(bodyStyle.paddingBottom) || 0) : 0;
          
          return Math.max(maxBottom + bodyMargin + bodyPadding, minHeight);
        };
        
        // Helper function to update height with debounce protection
        const updateHeight = () => {
          if (isUpdating) return;
          isUpdating = true;
          
          requestAnimationFrame(() => {
            const newHeight = getContentHeight();
            
            // Only update if height actually changed (prevents unnecessary reflows)
            if (Math.abs(newHeight - lastHeight) > 1) {
              style.height = `${newHeight}px`;
              lastHeight = newHeight;
            }
            
            isUpdating = false;
          });
        };

        // ResizeObserver: detect when content size changes (usually when content grows)
        const resizeObserver = new ResizeObserver(() => {
          updateHeight();
        });
        resizeObserver.observe(contentDocument.body);
        this.sizeObserver = resizeObserver;

        // MutationObserver: detect when DOM changes (add/remove elements)
        // This is critical for detecting when elements are removed (canvas should shrink)
        const mutationObserver = new MutationObserver(() => {
          updateHeight();
        });
        mutationObserver.observe(contentDocument.body, {
          childList: true,    // Detect direct child additions/removals
          subtree: true,      // Detect changes in all descendants
          attributes: true,   // Detect attribute changes (e.g., style changes)
          characterData: true // Detect text content changes
        });
        this.mutationObserver = mutationObserver;

        // Initial height calculation
        updateHeight();
      }
    } else {
      style.height = newHeight;
      delete this.sizeObserver;
      delete this.mutationObserver;
    }

    return { noChanges, width, height, newW, newH };
  }

  render() {
    const { frame, $el, ppfx, cv, model, el } = this;
    const { onRender } = model.attributes;
    this.__clear();
    this.__handleSize();
    frame.render();
    $el
      .empty()
      .attr({ class: `${ppfx}frame-wrapper` })
      .append(
        `
      <div class="${ppfx}frame-wrapper__top gjs-two-color" data-frame-top>
        <div class="${ppfx}frame-wrapper__name" data-action-move>
          ${model.get('name') || ''}
        </div>
        <div class="${ppfx}frame-wrapper__top-r">
          <div class="${ppfx}frame-wrapper__icon" data-action-remove style="display: none">
            <svg viewBox="0 0 24 24"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"></path></svg>
          </div>
        </div>
      </div>
      <div class="${ppfx}frame-wrapper__right" data-frame-right></div>
      <div class="${ppfx}frame-wrapper__left" data-frame-left></div>
      <div class="${ppfx}frame-wrapper__bottom" data-frame-bottom></div>
      `,
      )
      .append(frame.el);
    const elTools = createEl(
      'div',
      {
        class: `${ppfx}tools`,
        style: 'pointer-events:none; display: none',
      },
      `
      <div class="${ppfx}highlighter" data-hl></div>
      <div class="${ppfx}badge" data-badge></div>
      <div class="${ppfx}placeholder">
        <div class="${ppfx}placeholder-int"></div>
      </div>
      <div class="${ppfx}ghost"></div>
      <div class="${ppfx}toolbar" style="pointer-events:all"></div>
      <div class="${ppfx}resizer"></div>
      <div class="${ppfx}offset-v" data-offset>
        <div class="gjs-marginName" data-offset-m>
          <div class="gjs-margin-v-el gjs-margin-v-top" data-offset-m-t></div>
          <div class="gjs-margin-v-el gjs-margin-v-bottom" data-offset-m-b></div>
          <div class="gjs-margin-v-el gjs-margin-v-left" data-offset-m-l></div>
          <div class="gjs-margin-v-el gjs-margin-v-right" data-offset-m-r></div>
        </div>
        <div class="gjs-paddingName" data-offset-m>
          <div class="gjs-padding-v-el gjs-padding-v-top" data-offset-p-t></div>
          <div class="gjs-padding-v-el gjs-padding-v-bottom" data-offset-p-b></div>
          <div class="gjs-padding-v-el gjs-padding-v-left" data-offset-p-l></div>
          <div class="gjs-padding-v-el gjs-padding-v-right" data-offset-p-r></div>
        </div>
      </div>
      <div class="${ppfx}offset-fixed-v"></div>
    `,
    );
    this.elTools = elTools;
    const twrp = cv?.toolsWrapper;
    twrp && twrp.appendChild(elTools); // TODO remove on frame remove
    onRender &&
      onRender({
        el,
        elTop: el.querySelector('[data-frame-top]'),
        elRight: el.querySelector('[data-frame-right]'),
        elBottom: el.querySelector('[data-frame-bottom]'),
        elLeft: el.querySelector('[data-frame-left]'),
        frame: model,
        frameWrapperView: this,
        remove: this.remove,
        startDrag: this.startDrag,
      });
    return this;
  }
}
