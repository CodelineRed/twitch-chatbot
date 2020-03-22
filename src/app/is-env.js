/**
 * Returns true if is matching environment
 *
 * @param env string|array
 * @param currentEnv string
 */
function isEnv(env, currentEnv) {
    if (typeof env === 'string') {
        if (typeof currentEnv === 'string') {
            return currentEnv === env;
        }

        if (typeof currentEnv === 'object') {
            return currentEnv.indexOf(env) > -1;
        }
    }

    if (typeof env === 'object') {
        if (typeof currentEnv === 'string') {
            return env.indexOf(currentEnv) > -1;
        }

        if (typeof currentEnv === 'object') {
            for (const cenv of currentEnv) {
                for (const penv of env) {
                    if (cenv === penv) {
                        return true;
                    }
                }
            }
        }
    }

    return false;
}

module.exports = isEnv;
