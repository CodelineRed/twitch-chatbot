<script>
    export default {
        methods: {
            getOauthTokenLink: function() {
                return `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=mfatyz3gbgk3irt7sygwdfd2qa09wt&redirect_uri=${document.location.origin}&force_verify=true&scope=chat:read+chat:edit+channel:moderate+whispers:read+whispers:edit+moderator:read:followers+user:edit:broadcast+channel_editor`;
            },
            getReportBugPopover: function() {
                let email = this.$t('email') + ': <a href="mailto:software@codelinered.net">software@codelinered.net</a><br>';
                let github = this.$t('github') + ': <a href="https://github.com/CodelineRed/twitch-chatbot/issues" target="_blank">' + this.$t('app') + '</a>';

                return email + github;
            }
        }
    };
</script>

<template>
    <div class="col-auto">
        <router-link class="btn btn-sm btn-primary mr-2" :to="{name: 'index'}"><font-awesome-icon :icon="['fas', 'home']" class="fa-fw" /></router-link>
        <a class="btn btn-sm btn-success text-dark mr-2" target="_blank" :href="getOauthTokenLink()"><font-awesome-icon :icon="['fab', 'twitch']" class="fa-fw mr-1" />{{ $t('token-twitch') }}</a>
        <a class="btn btn-sm btn-warning" tabindex="0" data-toggle="popover" data-trigger="focus" :data-content="getReportBugPopover()"><font-awesome-icon :icon="['fas', 'bug']" class="fa-fw mr-1" />{{ $t('report-bug') }}</a>
    </div>
</template>
