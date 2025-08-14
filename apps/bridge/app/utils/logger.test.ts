/**
 * Logger功能测试
 * 这个文件用于测试logger的各种功能，可以在浏览器控制台中运行
 */
import { LogCategory, LogLevel, log, logError, logNet, logTx, logger } from './logger';

// 测试函数
export const testLogger = () => {
    console.group('🧪 Logger功能测试');

    // 测试不同级别的日志
    console.log('📊 测试日志级别...');
    logger.debug(LogCategory.DEBUG, 'Debug测试', { test: 'debug' });
    logger.info(LogCategory.GENERAL, 'Info测试', { test: 'info' });
    logger.warn(LogCategory.BRIDGE, 'Warn测试', { test: 'warn' });
    logger.error(LogCategory.ERROR, 'Error测试', new Error('测试错误'));
    logger.critical(LogCategory.ERROR, 'Critical测试', new Error('严重错误'));

    // 测试不同分类的日志
    console.log('🏷️ 测试日志分类...');
    logger.info(LogCategory.API, 'API测试', { endpoint: '/test' });
    logger.info(LogCategory.TRANSACTION, '交易测试', { hash: '0x123...' });
    logger.info(LogCategory.NETWORK, '网络测试', { chainId: 1 });
    logger.info(LogCategory.WALLET, '钱包测试', { address: '0x456...' });
    logger.info(LogCategory.BRIDGE, 'Bridge测试', { from: 'ETH', to: 'ENI' });

    // 测试向后兼容API
    console.log('🔄 测试向后兼容API...');
    log('兼容性测试', { data: 'compatible' });
    logTx('交易兼容性测试', { hash: '0x789...' });
    logNet('网络兼容性测试', { status: 'connected' });
    logError('错误兼容性测试', new Error('兼容性错误'));

    // 测试配置
    console.log('⚙️ 测试配置管理...');
    const currentConfig = logger.getConfig();
    console.log('当前配置:', currentConfig);

    // 测试配置更新
    logger.updateConfig({
        level: LogLevel.DEBUG,
        enableConsole: true,
    });

    console.log('更新后配置:', logger.getConfig());

    // 恢复原配置
    logger.updateConfig(currentConfig);

    console.groupEnd();
    console.log('✅ Logger测试完成！');
};

// 测试错误监控
export const testErrorMonitoring = () => {
    console.group('🚨 错误监控测试');

    // 测试全局错误
    console.log('测试全局错误...');
    setTimeout(() => {
        throw new Error('测试全局错误');
    }, 100);

    // 测试Promise拒绝
    console.log('测试Promise拒绝...');
    setTimeout(() => {
        Promise.reject(new Error('测试Promise拒绝'));
    }, 200);

    console.groupEnd();
    console.log('⚠️ 错误监控测试已启动，请查看控制台错误信息');
};

// 测试远程日志
export const testRemoteLogging = () => {
    console.group('📤 远程日志测试');

    // 模拟大量日志
    for (let i = 0; i < 10; i++) {
        logger.info(LogCategory.GENERAL, `远程日志测试 ${i + 1}`, {
            index: i,
            timestamp: new Date().toISOString(),
        });
    }

    console.groupEnd();
    console.log('📤 远程日志测试完成，日志将根据配置发送到远程服务器');
};

// 性能测试
export const testPerformance = () => {
    console.group('⚡ 性能测试');

    const startTime = performance.now();
    const logCount = 1000;

    for (let i = 0; i < logCount; i++) {
        logger.debug(LogCategory.DEBUG, `性能测试 ${i + 1}`, { index: i });
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`📊 性能测试结果:`);
    console.log(`- 日志数量: ${logCount}`);
    console.log(`- 总耗时: ${duration.toFixed(2)}ms`);
    console.log(`- 平均每条日志: ${(duration / logCount).toFixed(3)}ms`);
    console.log(`- 每秒日志数: ${(logCount / (duration / 1000)).toFixed(0)}`);

    console.groupEnd();
};

// 导出所有测试函数
export const runAllTests = () => {
    console.log('🚀 开始运行所有Logger测试...');

    testLogger();

    setTimeout(() => {
        testErrorMonitoring();
    }, 1000);

    setTimeout(() => {
        testRemoteLogging();
    }, 2000);

    setTimeout(() => {
        testPerformance();
    }, 3000);
};

// 在浏览器控制台中运行测试
if (typeof window !== 'undefined') {
    (window as any).testLogger = testLogger;
    (window as any).testErrorMonitoring = testErrorMonitoring;
    (window as any).testRemoteLogging = testRemoteLogging;
    (window as any).testPerformance = testPerformance;
    (window as any).runAllTests = runAllTests;

    console.log('🧪 Logger测试函数已加载到全局作用域:');
    console.log('- testLogger(): 测试基本日志功能');
    console.log('- testErrorMonitoring(): 测试错误监控');
    console.log('- testRemoteLogging(): 测试远程日志');
    console.log('- testPerformance(): 测试性能');
    console.log('- runAllTests(): 运行所有测试');
}
