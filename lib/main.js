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
exports.run = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const github_1 = require("./github");
const shortcut_1 = require("./shortcut");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const releaseName = core.getInput("release_name", {
                required: true,
            });
            const workflowName = core.getInput("workflow", { required: true });
            const workflowStateName = core.getInput("workflow_state", {
                required: true,
            });
            const releaseTicketId = core.getInput("release_ticket_id", {
                required: true,
            });
            if (!process.env.GITHUB_TOKEN) {
                throw new Error("GITHUB_TOKEN env variable is not set");
            }
            if (!process.env.SHORTCUT_TOKEN) {
                throw new Error("SHORTCUT_TOKEN env variable is not set");
            }
            const shortcutToken = process.env.SHORTCUT_TOKEN;
            const { owner, repo } = github.context.repo;
            // const owner = 'gradual-inc'
            // const repo = 'gradual'
            const release = yield (0, github_1.getRelease)({
                owner,
                repo,
                releaseName,
                token: process.env.GITHUB_TOKEN,
            });
            core.info(`get release ${release.name}`);
            const tickets = (0, github_1.getStoryIdsFromRelease)({
                content: release.body,
                rex: /SC-(\d+)/g,
            });
            const stateId = yield (0, shortcut_1.getStateId)({
                workflowName,
                workflowStateName,
                token: shortcutToken,
            });
            core.startGroup(`start update tickets ${tickets.join(",")}`);
            yield Promise.all(tickets.map((ticket) => __awaiter(this, void 0, void 0, function* () {
                yield (0, shortcut_1.updateStory)({
                    stateId,
                    releaseTicketId,
                    storyId: ticket,
                    token: shortcutToken,
                });
            })));
            core.endGroup();
            yield (0, shortcut_1.updateReleaseTicket)({
                projectName: repo,
                releaseName: release.name,
                releaseContent: release.body || "",
                releaseUrl: release.html_url,
                token: shortcutToken,
                releaseTicketId,
            });
            core.info(`update release ticket: ${releaseTicketId}`);
        }
        catch (error) {
            if (error instanceof Error)
                core.setFailed(error.message);
        }
    });
}
exports.run = run;
run();
