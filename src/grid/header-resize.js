let pageInitialPosition;
let headerInitialWidth;
let onChangesCallback;
let onFinishCallback;
let tableHead;

// eslint-disable-next-line import/prefer-default-export
export const initResize = (header, $event, onChanges, onFinish) => {
  pageInitialPosition = $event.clientX;
  headerInitialWidth = header.offsetWidth;
  onChangesCallback = onChanges;
  onFinishCallback = onFinish;
  tableHead = header.parentNode.parentNode;
  tableHead.classList.add('resizing');
  // eslint-disable-next-line no-use-before-define
  window.addEventListener('mousemove', onMouseMove);
  // eslint-disable-next-line no-use-before-define
  window.addEventListener('mouseup', onMouseUp);
};

const onMouseMove = (e) => {
  requestAnimationFrame(() => {
    const newWIdth = headerInitialWidth + (e.clientX - pageInitialPosition);
    onChangesCallback(newWIdth);
  });
};

const onMouseUp = () => {
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
  tableHead.classList.remove('resizing');
  onFinishCallback();
};
