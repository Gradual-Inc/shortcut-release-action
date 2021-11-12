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
exports.getStoryIdsFromRelease = exports.getRelease = void 0;
const R = __importStar(require("ramda"));
const github = __importStar(require("@actions/github"));
function getRelease({ releaseName, token, repo, owner }) {
    return __awaiter(this, void 0, void 0, function* () {
        const githubClient = github.getOctokit(token).rest;
        const release = (yield githubClient.repos.getReleaseByTag({
            owner,
            repo,
            tag: releaseName
        })).data;
        if (!(release === null || release === void 0 ? void 0 : release.body)) {
            throw new Error(`Cannot find release ${releaseName}`);
        }
        return {
            body: release.body || '',
            id: release.id,
            name: release.name || release.tag_name,
            html_url: release.html_url
        };
    });
}
exports.getRelease = getRelease;
function getStoryIdsFromRelease({ content, rex }) {
    const tickets = [];
    let m;
    do {
        m = rex.exec(content);
        if (m && m[1]) {
            tickets.push(m[1]);
        }
    } while (m);
    return R.uniq(tickets);
}
exports.getStoryIdsFromRelease = getStoryIdsFromRelease;
