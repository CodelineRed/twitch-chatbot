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
    <div class="row">
        <div class="col-12">
            <div class="counter p-2">
                <div class="h3 text-center">
                    Counter
                </div>
                
                <div id="counter" class="h3 text-center mb-0">
                    {{ counter }}
                </div>
            </div>
        </div>
    </div>
</template>
