<script>
    export default {
        methods: {
            getOauthTokenLink: function() {
                return `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=mfatyz3gbgk3irt7sygwdfd2qa09wt&redirect_uri=${document.location.origin}&force_verify=true&scope=channel_editor+user_read`;
            }
        }
    };
</script>

<template>
    <div class="col-auto">
        <router-link class="btn btn-sm btn-primary mr-2" :to="{name: 'index'}"><font-awesome-icon :icon="['fas', 'home']" class="fa-fw" /></router-link>
        <a class="btn btn-sm btn-success" target="_blank" :href="getOauthTokenLink()">Connect Twitch-Account with Chatbot</a>
    </div>
</template>
