<script>
    import btnAnimation from '../../method/btn-animation';
    import dataTable from '../../method/data-table';

    export default {
        mixins: [btnAnimation, dataTable],
        data: function() {
            return {
                commands: [],
                deprecated: ['removeCustomCommand', 'toggleCustomCommand', 'updateCustomCommand']
            };
        },
        mounted: function() {
            this.getCommands();
        },
        methods: {
            checkDeprecated: function(name) {
                return this.deprecated.indexOf(name) >= 0;
            },
            getCommands: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getCommands',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            removeCustomCommand: function(index) {
                if (typeof socketWrite === 'function' && this.commands[index].type === 'custom') {
                    const call = {
                        method: 'removeCustomCommand',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            name: this.commands[index].name,
                            say: false
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            setCommands: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.commands = args.list;
                    this.initDataTable();
                }
            },
            updateCommand: function(index) {
                if (typeof socketWrite === 'function' 
                    && (this.commands[index].cooldown >= 0 && this.commands[index].cooldown <= 3600)) {
                    const call = {
                        method: 'updateCommand',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            item: this.commands[index],
                            index: index
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                    this.btnAnimation(event.target, 'success');
                    this.updateDataTableRow(index, 'commandsTable');
                } else {
                    this.btnAnimation(event.target, 'error');
                    this.updateDataTableRow(index, 'commandsTable');
                }
            },
            updateCommandLastExec: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.commands[args.index].lastExec = args.lastExec;
                    this.updateDataTableRow(args.index, 'commandsTable');
                }
            }
        }
    };
</script>

<template>
    <div class="row">
        <div class="col-12">
            <div class="commands p-2">
                <div class="h4 text-center">
                    {{ $tc('command', 2) }}
                </div>
                <div v-if="commands.length > 0" class="table-responsive">
                    <table id="commandsTable" class="table table-striped table-hover table-dark data-table">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">{{ $t('name') }}</th>
                                <th scope="col">{{ $t('cooldown') }}</th>
                                <th scope="col">{{ $t('last-exec') }}</th>
                                <th scope="col">{{ $t('active') }}</th>
                                <th scope="col">{{ $t('type') }}</th>
                                <th scope="col" class="text-center" data-orderable="false">
                                    <span class="d-none" data-toggle="tooltip" data-placement="top" title="Refresh" @click="getCommands()">
                                        <font-awesome-icon :icon="['fas', 'sync']" class="fa-fw" />
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- eslint-disable-next-line vue/require-v-for-key -->
                            <tr v-for="(command, index) in commands" class="video">
                                <td>{{ index + 1 }}</td>
                                <td v-if="checkDeprecated(command.name)">
                                    <s>{{ command.name }}</s>
                                </td>
                                <td v-else>
                                    {{ command.name }}
                                </td>
                                <td :data-order="command.cooldown">
                                    <div class="input-group input-group-sm">
                                        <input v-model.number="commands[index].cooldown" type="number" min="0" max="3600" class="form-control" :class="{'is-invalid': commands[index].cooldown < 0 || commands[index].cooldown > 3600}">
                                        <div class="input-group-append">
                                            <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                                            <div class="input-group-text">s</div>
                                        </div>
                                    </div>
                                </td>
                                <td :data-order="command.lastExec">
                                    <span class="d-inline-block text-nowrap" data-toggle="tooltip" data-placement="top" :title="command.lastExec|formatDateTime($t('datetime'))">
                                        {{ command.lastExec|formatDateTime($t('time-long-suffix')) }}
                                    </span>
                                </td>
                                <td :data-order="command.active ? '1' : '0'" :data-search="command.active ? 'active-yes' : 'active-no'">
                                    <div class="custom-control custom-switch">
                                        <input :id="'command-active-' + index" v-model.number="commands[index].active" type="checkbox" class="custom-control-input">
                                        <label class="custom-control-label" :for="'command-active-' + index">&nbsp;</label>
                                    </div>
                                </td>
                                <td>{{ command.type }}</td>
                                <td class="text-center">
                                    <span class="text-nowrap">
                                        <button type="button" class="btn btn-sm btn-primary btn-animation mr-2" data-animation-success="success" data-animation-error="error" data-toggle="tooltip" data-placement="top" :title="$t('save')" @click="updateCommand(index)"><font-awesome-icon :icon="['fas', 'save']" class="fa-fw" /></button>
                                        <button v-if="command.type == 'custom'" type="button" class="btn btn-sm btn-danger" data-toggle="tooltip" data-placement="top" :title="$t('remove')" @click="removeCustomCommand(index)"><font-awesome-icon :icon="['fas', 'trash-alt']" class="fa-fw" /></button>
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
