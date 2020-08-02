k<template>
  <div>
    <md-card>
      <md-card-header class="card-header">
        <span class="md-title">版本</span>
        <div class="md-header-actions">
          <md-button class="action-item md-raised md-primary" @click="onClickAdd">
            <md-icon class="iconfont icon-add"></md-icon>
          </md-button>
          <md-button
            v-show="isShowBatchButtons"
            class="action-item md-raised md-accent"
            @click="onBatchDelete"
          >删除</md-button>

          <md-button
            v-show="isShowBatchButtons && this.selectedRules.some(item => !item.enable)"
            class="action-item md-raised"
            @click="onBatchSwitch(true)"
          >开启</md-button>
          <md-button
            v-show="isShowBatchButtons && this.selectedRules.some(item => item.enable)"
            class="action-item md-raised"
            @click="onBatchSwitch(false)"
          >关闭</md-button>
        </div>
      </md-card-header>
      <md-card-content>
        <md-table @md-selected="onSelect" v-model="rules">
          <md-table-row slot="md-table-row" slot-scope="{item, index}" md-selectable="multiple">
            <md-table-cell md-label="启用">
              <md-switch
                v-model="item.enable"
                class="md-primary"
                @change="newValue => onRuleEnable(item, newValue)"
              ></md-switch>
            </md-table-cell>
            <md-table-cell md-label="产品" md-sort-by="product">
              {{PRODUCTION_MAP[item.product] && PRODUCTION_MAP[item.product].label || item.product}}
              <md-tooltip md-delay="300" md-direction="top">{{item.redirectUrl}}</md-tooltip>
            </md-table-cell>
            <md-table-cell md-label="版本号">{{item.env === 'local' ? '/' : item.version}}</md-table-cell>
            <md-table-cell
              md-label="环境"
            >{{ENVIRONMENT_MAP[item.env] && ENVIRONMENT_MAP[item.env].label || item.env}}</md-table-cell>
            <md-table-cell md-label="操作">
              <span
                class="md-primary g-pointer g-operation"
                @click.prevent="onEdite(item, index)"
              >编辑</span>
              <span
                class="md-primary g-pointer g-operation"
                @click.prevent="onDelete(item, index)"
              >删除</span>
            </md-table-cell>
          </md-table-row>
        </md-table>
      </md-card-content>
    </md-card>

    <md-dialog :md-active.sync="showDialog" :md-fullscreen="false" class="dialog">
      <md-dialog-title v-show="status !== 'edit'">添加版本</md-dialog-title>
      <md-dialog-title v-show="status === 'edit'">编辑版本</md-dialog-title>
      <md-dialog-conten class="dialog-content">
        <FormGroup>
          <template v-slot:left>产品：</template>
          <template v-slot:right>
            <md-field>
              <md-select v-model="rule.product" >
                <md-option value="test">test</md-option>
                <md-option
                  v-for="product in products"
                  :value="product.value"
                  :key="product.value"
                >{{product.label}}</md-option>
              </md-select>
            </md-field>
          </template>
        </FormGroup>
        <FormGroup>
          <template v-slot:left>环境：</template>
          <template v-slot:right>
            <md-radio
              v-for="env in environments"
              :key="env.value"
              v-model="rule.env"
              :value="env.value"
            >{{env.label}}</md-radio>
          </template>
        </FormGroup>
        <FormGroup v-show="rule.env === 'local'">
          <template v-slot:left>重定向到：</template>
          <template v-slot:right>
            <md-field>
              <label>http://127.0.0.1:8080/js/index.js</label>
              <md-input v-model="rule.local"></md-input>
            </md-field>
          </template>
        </FormGroup>
        <FormGroup v-show="rule.env !== 'local'">
          <template v-slot:left>版本号：</template>
          <template v-slot:right>
            <md-field>
              <md-input v-model="rule.version"></md-input>
            </md-field>
          </template>
        </FormGroup>
        <FormGroup v-show="rule.env !== 'local'">
          <template v-slot:left>重定向到：</template>
          <template v-slot:right>
            <div class="redirect-url" :title="redirectUrl">{{makeRedirectUrl(rule)}}</div>
          </template>
        </FormGroup>
      </md-dialog-conten>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showDialog = false">取消</md-button>
        <md-button
          v-show="status !== 'edit'"
          class="md-primary"
          @click="onAdd(rule)"
          :disabled="isDisabeld"
        >添加</md-button>
        <md-button
          v-show="status === 'edit'"
          class="md-primary"
          @click="onSave(rule)"
          :disabled="isDisabeld"
        >保存</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
import {
  PRODUCTS,
  ENVIRONMENTS,
  ENVIRONMENT,
  PRODUCTION_MAP,
  ENVIRONMENT_MAP,
} from "./cons";
import FormGroup from "../FormGroup";
import utils from "../../core/utils";
import rules from "../../core/rules";
import browser from "webextension-polyfill";
import storage from "../../core/storage";

const status = {
  add: "add",
  edit: "edit",
};

const defaultRule = {
  product: "onerds",
  env: "pre",
  version: "4.1.19",
  enable: true,
};

export default {
  components: {
    FormGroup,
  },
  data() {
    return {
      PRODUCTION_MAP,
      ENVIRONMENT_MAP,
      collapse: false,
      showDialog: false,
      isShowBatchButtons: false,
      products: PRODUCTS,
      environments: ENVIRONMENTS,
      status: status.create,
      rule: {
        ...defaultRule,
      },
      rules: [],
      index: 0,
      selectedRules: [],
    };
  },

  computed: {
    isDisabeld() {
      const rule = this.rule;
      if (rule.env === ENVIRONMENT.local) {
        return !rule.local;
      }
      return !rule.version.trim();
    },
  },

  created() {
    storage.prefs.onReady().then((prefs) => {
      this.loadRules();
    });
  },

  methods: {
    loadRules() {
      const _this = this;

      this.isLoadingRules = true;
      this.group = {};

      const appendRule = (table, response) => {
        const rules = response
          .filter((item) => item.group === "versions")
          .map((item) => {
            item["_v_key"] = table + "-" + item.id;
            return item;
          });
        this.rules = rules;
      };
      function checkResult(table, response) {
        if (!response) {
          // Browser is starting up
          requestRules(table);
          return;
        }
        appendRule(table, response);
      }
      function requestRules(table) {
        setTimeout(() => {
          checkResult(table, rules.get(table));
        }, 20);
      }

      requestRules("request");
    },

    makeRedirectUrl(rule) {
      const { env, version, local, product } = rule;
      let url = "";
      const producInfo =
        this.products.find((item) => item.value === product) || {};
      const { template } = producInfo;
      if (env === ENVIRONMENT.local) {
        url = local;
      }
      const prefix = env === ENVIRONMENT.production ? "" : "dev.";
      if (template) {
        url = template.replace("${env}", prefix).replace("${version}", version);
      }
      return url;
    },

    onClickAdd() {
      this.status = status.add;
      this.rule = { ...defaultRule };
      this.showDialog = true;
    },

    onSave(rule) {
      const index = this.index;
      this.rules.splice(index, 1, rule);
      this.showDialog = false;
      this.setRule(rule);
    },

    setRule(rule) {
      const { product } = rule;
      const produnctInfo = PRODUCTION_MAP[product];
      const data = {
        ...produnctInfo,
        ...rule,
        enable: true,
        name: produnctInfo.label,
        ruleType: "redirect",
        matchType: "regexp",
        pattern: produnctInfo.pattern,
        exclude: "",
        group: "versions",
        isFunction: false,
        action: "redirect",
        to: this.makeRedirectUrl(rule),
      };
      const table = utils.getTableName(data.ruleType);
      rules.save(table, data).then((response) => {
        const v_key = table + "-" + response.id;
        response._v_key = v_key;
        browser.runtime.sendMessage({ method: "updateCache", type: table });
        this.loadRules();
      });
    },

    onSelect(items) {
      this.isShowBatchButtons = !!items.length;
      this.selectedRules = items;
    },

    onAdd(rule) {
      this.rules.push({ ...rule, redirectUrl: this.redirectUrl });
      this.showDialog = false;
      this.setRule(rule);
    },

    onEdite(rule, index) {
      this.rule = { ...rule, redirectUrl: this.redirectUrl };
      this.index = index;
      this.status = status.edit;
      this.showDialog = true;
    },

    onDelete(rule) {
      const table = utils.getTableName(rule.ruleType);
      const key = table + "-" + rule.id;
      rules.remove(table, rule.id).then((response) => {
        browser.runtime.sendMessage({ method: "updateCache", type: table });
        this.loadRules();
      });
    },

    onBatchDelete() {
      if (!confirm(utils.t("delete_confirm"))) {
        return;
      }
      this.selectedRules.forEach((e) => this.onDelete(e));
      this.selectedRules = [];
    },

    onRuleEnable(rule, newValue) {
      const table = utils.getTableName(rule.ruleType);
      rules.save(table, rule).then((response) => {
        browser.runtime.sendMessage({ method: "updateCache", type: table });
      });
    },

    onBatchSwitch(enable) {
      const selectedRules = this.selectedRules;
      const table = [];
      const queue = [];

      selectedRules.forEach((rule) => {
        rule.enable = enable;
        const tableName = utils.getTableName(rule.ruleType);
        queue.push(rules.save(tableName, rule));
        if (!table.includes(tableName)) {
          table.push(tableName);
        }
      });
      Promise.all(queue).then(() => {
        table.forEach((t) => {
          browser.runtime.sendMessage({ method: "updateCache", type: t });
        });
      });
    },
  },
};
</script>

<style lang="less" scoped>
.card-header {
  overflow: hidden;
}

.md-title {
  margin-top: 0;
  text-align: left;
  float: left;
}

.md-header-actions {
  float: right;
  display: flex;
}

.action-item {
  height: 32px;
  line-height: 32px;
  size: 32px;
}

.action-item__margin {
  margin-left: 10px;
}

.dialog-content {
  width: 800px;
  padding-left: 30px;
  padding-right: 30px;
}

.redirect-url {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.g-pointer {
  cursor: pointer;
}
.g-operation {
  margin-right: 20px;
}
</style>>
