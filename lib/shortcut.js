"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReleaseTicket = exports.updateStory = exports.getStateId = void 0;
const R = __importStar(require("ramda"));
const core = __importStar(require("@actions/core"));
const client_1 = require("@useshortcut/client");
function getStateId({ workflowName, workflowStateName, token }) {
    return __awaiter(this, void 0, void 0, function* () {
        const shortcut = new client_1.ShortcutClient(token);
        const workflows = (yield shortcut.listWorkflows()).data;
        const workflow = R.find(w => w.name === workflowName, workflows);
        if (!(workflow === null || workflow === void 0 ? void 0 : workflow.states)) {
            throw new Error(`Can not find workflow ${workflowName}`);
        }
        const state = R.find(s => s.name === workflowStateName, workflow === null || workflow === void 0 ? void 0 : workflow.states);
        if (!state) {
            throw new Error(`Can not find workflow ${workflowStateName}`);
        }
        return state.id;
    });
}
exports.getStateId = getStateId;
function updateStory({ stateId, storyId, releaseTicketId, token }) {
    return __awaiter(this, void 0, void 0, function* () {
        const shortcut = new client_1.ShortcutClient(token);
        try {
            yield shortcut.updateStory(Number(storyId), {
                workflow_state_id: stateId
            });
            core.info(`updated ticket ${storyId}`);
        }
        catch (e) {
            core.warning(`fail to update ticket ${storyId} with error: ${e}`);
        }
        try {
            yield shortcut.createStoryLink({
                object_id: Number(releaseTicketId),
                subject_id: Number(storyId),
                verb: 'relates to'
            });
            core.info(`linked story ${storyId} to release story ${releaseTicketId}`);
        }
        catch (e) {
            core.warning(`fail to link ticket ${storyId} with error: ${e}`);
        }
    });
}
exports.updateStory = updateStory;
function updateReleaseTicket({ projectName, releaseContent, releaseName, releaseUrl, releaseTicketId, token }) {
    return __awaiter(this, void 0, void 0, function* () {
        const shortcut = new client_1.ShortcutClient(token);
        const releaseTicketContent = (yield shortcut.getStory(Number(releaseTicketId))).data;
        const re = new RegExp(releaseName);
        if (!releaseTicketContent.description.match(re)) {
            yield shortcut.updateStory(Number(releaseTicketId), {
                description: `\n${releaseTicketContent.description} \n # ${projectName} [${releaseName}](${releaseUrl}) \n\n ${releaseContent}\n\n`
            });
        }
        core.info(`updated description of release ticket ${releaseTicketId}`);
    });
}
exports.updateReleaseTicket = updateReleaseTicket;
