<template>
  <div>
    <md-card v-for="g of group" :key="g.name" class="group-item">
      <md-card-header>
        <div class="md-title">{{g.name}}</div>
        <md-button class="md-icon-button" @click="g.collapse = !g.collapse">
          <md-icon v-show="!g.collapse" class="iconfont icon-keyboard-arrow-up"></md-icon>
          <md-icon v-show="g.collapse" class="iconfont icon-keyboard-arrow-down"></md-icon>
        </md-button>
      </md-card-header>
      <md-card-content>
        <md-table v-show="!g.collapse">
          <md-table-row>
            <md-table-head class="cell-batch">
              <span @click="onBatchSelectGroup(g)" style="cursor: pointer">{{t('batch_mode')}}</span>
            </md-table-head>
            <md-table-head class="cell-enable">{{t('enable')}}</md-table-head>
            <md-table-head class="cell-name">{{t('name')}}</md-table-head>
            <md-table-head class="cell-type">{{t('env')}}</md-table-head>
            <md-table-head class="cell-type">{{t('version')}}</md-table-head>
            <md-table-head class="cell-action">{{t('action')}}</md-table-head>
          </md-table-row>
          <md-table-row v-for="r of g.rule" :key="r._v_key">
            <md-table-cell class="cell-batch">
              <md-checkbox v-model="batch" :value="r" class="md-primary"></md-checkbox>
            </md-table-cell>
            <md-table-cell class="cell-enable">
              <md-switch
                v-model="r.enable"
                class="md-primary"
                :data-type="r.ruleType"
                :data-id="r.id"
                @change="newValue => onRuleEnable(r, newValue)"
              ></md-switch>
            </md-table-cell>
            <md-table-cell class="cell-name">
              <span>{{r.name}}</span>
              <md-tooltip md-direction="bottom">
                <p>{{t('matchType')}}: {{t('match_' + r.matchType)}}</p>
                <p>{{t('matchRule')}}: {{r.pattern}}</p>
                <p>{{t('exec_type')}}: {{t('exec_' + (r.isFunction ? 'function' : 'normal'))}}</p>
                <p v-if="r.ruleType === 'redirect'">{{t('redirectTo')}}: {{r.to}}</p>
                <p
                  v-if="r.ruleType === 'modifyReceiveBody'"
                >{{t('encoding')}}: {{r.encoding || encodingsList[0]}}</p>
                <p
                  v-if="(r.ruleType === 'modifySendHeader' || r.ruleType === 'modifyReceiveHeader') && !r.isFunction"
                >{{t('headerName')}}: {{r.action.name}}</p>
                <p
                  v-if="(r.ruleType === 'modifySendHeader' || r.ruleType === 'modifyReceiveHeader') && !r.isFunction"
                >{{t('headerValue')}}: {{r.action.value}}</p>
              </md-tooltip>
            </md-table-cell>
             <md-table-cell class="cell-env">
              <md-field>
                <md-select v-model="r.env">
                <md-option value="pre">pre</md-option>
                <md-option value="production">production</md-option>
              </md-select>
              </md-field>
            <md-table-cell class="cell-version">
              <md-field>
                <md-input v-model="r.version"></md-input>
              </md-field>
            </md-table-cell>
            </md-table-cell>
            <md-table-cell class="cell-action">
              <md-button class="with-icon delete-button" @click="onSaveRule(r)">
                <md-icon class="iconfont icon-delete"></md-icon>
                <span>{{t('save')}}</span>
              </md-button>
              <md-button class="with-icon delete-button" @click="onRemoveRule(r)">
                <md-icon class="iconfont icon-delete"></md-icon>
                <span>{{t('delete')}}</span>
              </md-button>
            </md-table-cell>
          </md-table-row>
        </md-table>
      </md-card-content>
    </md-card>
  </div>
</template>

<script>
export default {};
</script>

<style>
</style>