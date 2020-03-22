<script>
    export default {
        data: function() {
            return {
                counter: 0
            };
        },
        methods: {
            setCounter: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.counter = args.counter;
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
