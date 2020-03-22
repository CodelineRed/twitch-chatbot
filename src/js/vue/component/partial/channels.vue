<script>
    export default {
        data: function() {
            return {
                channels: []
            };
        },
        mounted: function() {
            this.getChannels();
        },
        methods: {
            setChannels: function(args) {
                this.channels = args.channels.split(';');
            },
            getChannels: function() {
                streamWrite({method: 'getChannels', env: 'node'});
            }
        }
    };
</script>

<template>
    <div class="channels card-columns">
        <div v-for="channel in channels" :key="channel" class="card">
            <div class="card-body">
                <h5 class="card-title text-center mb-0">
                    {{ channel }}
                </h5>
                <router-link class="stretched-link" :to="{ name: 'channel', params: { channel: channel } }" />
            </div>
        </div>
        <div class="card d-none">
            <div class="card-body">
                <h5 class="card-title text-center mb-0">
                    + Add Channel
                </h5>
                <a href="#" class="stretched-link" @click="getChannels()"></a>
            </div>
        </div>
    </div>
</template>
