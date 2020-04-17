import { default as category } from './categories'
import { default as algorithm } from './algorithmCategories'
import { isDynamicArrayLengthAccess } from './staticAnalysisCommon'
import { AnalyzerModule, ModuleAlgorithm, ModuleCategory, ReportObj, CompilationResult, ForStatementAstNode} from './../../types'

export default class forLoopIteratesOverDynamicArray implements AnalyzerModule {
  relevantNodes: ForStatementAstNode[] = []
  name: string = 'For loop iterates over dynamic array: '
  description: string = 'The number of \'for\' loop iterations depends on dynamic array\'s size'
  category: ModuleCategory = category.GAS
  algorithm: ModuleAlgorithm = algorithm.EXACT

  visit (node: ForStatementAstNode): void {
      const  { condition } = node
      // Check if condition is `i < array.length - 1`
      if ((condition && condition.nodeType === "BinaryOperation"  && condition.rightExpression.nodeType === "BinaryOperation" && isDynamicArrayLengthAccess(condition.rightExpression.leftExpression)) || 
      // or condition is `i < array.length`
      (condition && condition.nodeType === "BinaryOperation" && isDynamicArrayLengthAccess(condition.rightExpression))) {
        this.relevantNodes.push(node)
      }
  }

  report (compilationResults: CompilationResult): ReportObj[] {
    return this.relevantNodes.map((node) => {
      return {
        warning: 'Loops that do not have a fixed number of iterations, for example, loops that depend on storage values, have to be used carefully: Due to the block gas limit, transactions can only consume a certain amount of gas. The number of iterations in a loop can grow beyond the block gas limit which can cause the complete contract to be stalled at a certain point. Additionally, using unbounded loops incurs in a lot of avoidable gas costs. Carefully test how many items at maximum you can pass to such functions to make it successful.',
        location: node.src,
        more: 'http://solidity.readthedocs.io/en/v0.4.24/security-considerations.html#gas-limit-and-loops'
      }
    })
  }
}