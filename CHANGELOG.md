# Changelog

## 1.0.0 (2026-04-07)


### Features

* add apps activities, approved, requests, restricted list commands ([369d770](https://github.com/yamitzky/slack-admin-cli/commit/369d77010e8f6d47ac5f5fea31a565cfcbaf5d28))
* add apps approve, restrict, clear-resolution, uninstall commands ([b9f5ee8](https://github.com/yamitzky/slack-admin-cli/commit/b9f5ee8ea9f5d3f1dd4bc4bfc281e272907993be))
* add apps config lookup and set commands ([1221c2b](https://github.com/yamitzky/slack-admin-cli/commit/1221c2b319020ab19a846dde7ab0b301f16d28d7))
* add CLI entry point with all command routing ([1f96efc](https://github.com/yamitzky/slack-admin-cli/commit/1f96efc2e98875eaa6fa2595a887a63b165cd784))
* add conversations archive/unarchive/delete/convert-to-public commands ([fb7d986](https://github.com/yamitzky/slack-admin-cli/commit/fb7d98685543cd25a88c106bccd7d5d7f1cb6abc))
* add conversations bulk-archive/bulk-delete/bulk-move commands ([0b93307](https://github.com/yamitzky/slack-admin-cli/commit/0b933075fdafa7cc386bfc0d291b54c73b8095a6))
* add conversations ekm list-original-connected-channel-info command ([2b88cea](https://github.com/yamitzky/slack-admin-cli/commit/2b88ceaa584e3a1a6e712a818cf5bcbe5770d3a6))
* add conversations get-teams/set-teams with disconnect safety check ([f87e4d4](https://github.com/yamitzky/slack-admin-cli/commit/f87e4d4a6accb1feeb5c914d6cfa6320a4c7175d))
* add conversations invite/create commands ([e93431e](https://github.com/yamitzky/slack-admin-cli/commit/e93431e53f457798db1a8f7e57ecb7a0aa6ecb68))
* add conversations rename/convert-to-private/get-prefs/retention commands ([327ee67](https://github.com/yamitzky/slack-admin-cli/commit/327ee67654490c99d68569933220e4bf9c27c2c4))
* add conversations restrict-access add-group/list-groups/remove-group commands ([b0683ea](https://github.com/yamitzky/slack-admin-cli/commit/b0683eaf2349bc4f049b88dfdaa28b024bf11443))
* add conversations search/lookup commands ([adc00f6](https://github.com/yamitzky/slack-admin-cli/commit/adc00f61c6d73fe6b99a7c462f0a16e3654fb1b2))
* add conversations set-prefs/set-custom-retention/disconnect-shared commands ([a7b8fa3](https://github.com/yamitzky/slack-admin-cli/commit/a7b8fa30e050820b4353ff7f576234519c9494cf))
* add functions list, permissions lookup/set commands ([304a520](https://github.com/yamitzky/slack-admin-cli/commit/304a5207d1db78abac48496f38a96c52aff6dc0e))
* add invite-requests approve, deny, list, approved/list, denied/list commands ([5b3a7c6](https://github.com/yamitzky/slack-admin-cli/commit/5b3a7c675d458f7d5359d54f4d53a34d2404cd43))
* add output formatters (JSON, table, TSV) ([498bd4b](https://github.com/yamitzky/slack-admin-cli/commit/498bd4b20f50b42a001d9d8405bb2324cb01105b))
* add profile management with keychain storage ([c911225](https://github.com/yamitzky/slack-admin-cli/commit/c9112251766a8a2800a122695c08c274826b72a4))
* add Slack WebClient factory with profile resolution ([c05e2c5](https://github.com/yamitzky/slack-admin-cli/commit/c05e2c576c98be8adce7717e6530bb0021e1ec7b))
* add teams commands (create, list, admins list, owners list) ([4465516](https://github.com/yamitzky/slack-admin-cli/commit/4465516dffe59265397269bcd94151ce73cbeb6d))
* add teams settings commands (info, set-name, set-icon, set-description, set-discoverability) ([5f64c46](https://github.com/yamitzky/slack-admin-cli/commit/5f64c462ad4f6f15f90e080cf9a0ebd0f7ca4339))
* add token management commands (add, list, remove, status) ([caf5a7f](https://github.com/yamitzky/slack-admin-cli/commit/caf5a7fe9e8f9fb4783d018b99b53de945815f52))
* add users commands (list, invite, assign, remove, set-admin, set-owner, set-regular, session reset) ([ad82f46](https://github.com/yamitzky/slack-admin-cli/commit/ad82f46eab273cfc9d8af7880ef909b538f30fb2))
* add workflows permissions lookup and collaborators add/remove commands ([1c125e1](https://github.com/yamitzky/slack-admin-cli/commit/1c125e1e855f5e43132ebfd09aedd7b89b78d323))
* add workflows search and unpublish commands ([c91163c](https://github.com/yamitzky/slack-admin-cli/commit/c91163ca1552e26d93f04a13bff8f31cc6f3c535))
* wire up all 24 admin API commands (apps, invite-requests, workflows, functions) ([90d6e19](https://github.com/yamitzky/slack-admin-cli/commit/90d6e19f4a5429f3e30cf79216e8c9dbade89fe1))
* wire up all 25 conversations command handlers in index.ts ([4fc7de3](https://github.com/yamitzky/slack-admin-cli/commit/4fc7de34d0f2c6058e37554cdc5780f7c9422514))


### Bug Fixes

* strip global flags (--json, --plain, --profile) before passing to optique ([98889cc](https://github.com/yamitzky/slack-admin-cli/commit/98889cc1b2810902a497c7198dde5dc4bc4c3b71))
* use npm trusted publishing (OIDC) instead of NPM_TOKEN ([2c57092](https://github.com/yamitzky/slack-admin-cli/commit/2c5709252637f619404fc9ddb89d545a4b0660fa))
