
const loadBalancer = {}

loadBalancer.ROUND_ROBIN = (service) => {
    
    const newIndex = ++service.index >= service.instances.length ? 0 : service.index
    service.index = newIndex
    
    // return newIndex
    return loadBalancer.isEnabled(service, newIndex, loadBalancer.ROUND_ROBIN)
}

loadBalancer.isEnabled = (service, index, loadBalanceStrategy) => {
    return service.instances[index].enabled ? index : loadBalanceStrategy(service)
}

// Remember to export
module.exports = loadBalancer


// ====================================================================================================

/*
const loadbalancer = {}

    loadbalancer.ROUND_ROBIN = (service) => {
        const newIndex = ++service.index >= service.instances.length ? 0 : service.index
        service.index = newIndex
        return loadbalancer.isEnabled(service, newIndex, loadbalancer.ROUND_ROBIN)
    }

    loadbalancer.isEnabled = (service, index, loadBalanceStrategy) => {
        return service.instances[index].enabled ? index : loadBalanceStrategy(service)
    }
    module.exports = loadbalancer
*/