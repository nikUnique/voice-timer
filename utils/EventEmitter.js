import mitt from "mitt";

const emitter = mitt();
const resetTimerEmitter = mitt();

export { emitter, resetTimerEmitter };
