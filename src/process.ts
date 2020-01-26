import { Logger } from '@technote-space/github-action-helper';
import { exportVariable, getInput, setOutput } from '@actions/core' ;
import { getGitDiff } from './utils/command';
import { getDiffFiles, sumResults } from './utils/command';
import { DiffResult } from './types';

export const dumpOutput = (diff: DiffResult[], logger: Logger): void => {
	logger.startProcess('Dump output');
	console.log(diff);
	logger.endProcess();
};

export const setResult = (diff: DiffResult[]): void => {
	const result     = getDiffFiles(diff);
	const insertions = sumResults(diff, item => item.insertions);
	const deletions  = sumResults(diff, item => item.deletions);

	[
		{name: 'diff', value: result, envNameSuffix: ''},
		{name: 'count', value: diff.length},
		{name: 'insertions', value: insertions},
		{name: 'deletions', value: deletions},
		{name: 'lines', value: insertions + deletions},
	].forEach(setting => {
		const result = String(setting.value);
		setOutput(setting.name, result);
		const envName = getInput('SET_ENV_NAME' + (setting.envNameSuffix ?? `_${setting.name.toUpperCase()}`));
		if (envName) {
			exportVariable(envName, result);
		}
	});
};

export const execute = async(logger: Logger, diff?: DiffResult[]): Promise<void> => {
	const _diff = diff ?? await getGitDiff();
	dumpOutput(_diff, logger);
	setResult(_diff);
};
