export const PRODUCTS = [
	{
		value: "onerds",
		label: "RDS控制台",
		pattern:
			"https://\\S{0,}/aliyun-next/onerds/\\S{0,}/scripts/rds/rdsConsole.js",
		template:
			"https://${env}g.alicdn.com/aliyun-next/onerds/${version}/scripts/rds/rdsConsole.js"
	},
	{
		value: "rds-buy-next",
		label: "RDS新版售卖",
		pattern: "https://\\S{0,}/aliyun/rds-next-buy/\\S{0,}/index.js",
		template:
			"https://${env}g.alicdn.com/aliyun/rds-buy-next/${version}/index.js"
	},
	{
		value: "hdm-instance-create",
		label: "主机组实例创建",
		pattern: "https://\\S{0,}/widget/hdm-instance-create/\\S{0,}/index.js",
		template:
			"https://${env}g.alicdn.com/widget/hdm-instance-create/${version}/index.js"
	}
];

export const PRODUCTION_MAP = PRODUCTS.reduce((last, current) => {
	const { value } = current;
	last[value] = current;

	return last;
}, {});

// https://g.alicdn.com/aliyun/rds-buy-next/1.0.9/index.js
// https://g.alicdn.com/widget/xconsole-clouddb-connection/0.2.3/index.js

export const ENVIRONMENT = {
	production: "production",
	pre: "pre",
	local: "local"
};

export const ENVIRONMENTS = [
	{
		label: "生产",
		value: "production"
	},
	{
		label: "预发",
		value: "pre"
	},
	{
		label: "本地",
		value: "local"
	}
];

export const ENVIRONMENT_MAP = ENVIRONMENTS.reduce((last, current) => {
	const { value } = current;
	last[value] = current;

	return last;
}, {});