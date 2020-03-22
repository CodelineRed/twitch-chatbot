<script>
    export default {
        data: function() {
            return {
                counter: 0
            };
        },
        mounted: function() {
            this.getCounter();
        },
        methods: {
            setCounter: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.counter = args.counter;
                }
            },
            getCounter: function() {
                if (typeof streamWrite === 'function') {
                    const call = {
                        method: 'getCounter',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };
                    
                    streamWrite(call);
                }
            }
        }
    };
</script>

<template>
    <div id="counter">
        {{ counter }}
    </div>
</template>
