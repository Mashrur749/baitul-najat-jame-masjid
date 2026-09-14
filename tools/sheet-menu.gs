/**
 * Google Apps Script for the admins' website sheet ("বায়তুন নাযাত — ওয়েবসাইট তথ্য").
 *
 * Adds a "ওয়েবসাইট" menu to the sheet:
 *   এখনই আপডেট করুন — starts the site's deploy workflow on GitHub, so an edit is live in a few
 *                      minutes instead of at the next scheduled rebuild.
 *   স্ট্যাটাস দেখুন   — opens /status/, which lists every row and why any isn't on the site.
 *
 * Setup, once, by the sheet's owner:
 *   1. Extensions → Apps Script → replace the editor's contents with this file → Save.
 *   2. Project Settings (gear) → Script properties → Add: GITHUB_TOKEN = a fine-grained GitHub
 *      token for the repository below with only "Actions: Read and write".
 *   3. Reload the sheet, open ওয়েবসাইট → এখনই আপডেট করুন once and approve the permissions.
 *
 * Anyone who can edit this script can read the token. It can start (or cancel) this repo's
 * workflows and nothing else: it cannot read or change the code.
 */
const REPO = "Mashrur749/baitul-najat-jame-masjid";
const WORKFLOW = "deploy.yml";
const STATUS_URL = "https://baitunnajat.hikmahedu.com/status/";

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("ওয়েবসাইট")
    .addItem("এখনই আপডেট করুন", "publishNow")
    .addItem("স্ট্যাটাস দেখুন", "openStatus")
    .addToUi();
}

function publishNow() {
  const ui = SpreadsheetApp.getUi();
  const token = PropertiesService.getScriptProperties().getProperty("GITHUB_TOKEN");
  if (!token) {
    ui.alert("GITHUB_TOKEN সেট করা নেই — ডেভেলপারের সাথে যোগাযোগ করুন।");
    return;
  }
  const res = UrlFetchApp.fetch(`https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`, {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    payload: JSON.stringify({ ref: "main" }),
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() === 204) {
    ui.alert("আপডেট শুরু হয়েছে। ৪–৫ মিনিটের মধ্যে ওয়েবসাইটে দেখা যাবে।\n\nকোনো সারি বাদ পড়ল কি না দেখতে: ওয়েবসাইট → স্ট্যাটাস দেখুন");
  } else {
    ui.alert("আপডেট শুরু করা যায়নি (কোড " + res.getResponseCode() + ")। ডেভেলপারকে জানান।\n\n" + res.getContentText().slice(0, 300));
  }
}

function openStatus() {
  const html = HtmlService.createHtmlOutput(
    `<p style="font-family:sans-serif;font-size:15px">স্ট্যাটাস পাতা: <a href="${STATUS_URL}" target="_blank">${STATUS_URL}</a></p>`
  ).setWidth(440).setHeight(90);
  SpreadsheetApp.getUi().showModalDialog(html, "ওয়েবসাইট স্ট্যাটাস");
}
